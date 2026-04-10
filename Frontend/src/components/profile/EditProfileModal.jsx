import { useEffect, useMemo, useState } from "react";
import { Camera, X } from "lucide-react";
import toast from "react-hot-toast";
import { updateMyAvatar, updateMyProfile } from "../../api/profileEditApi";
import { getDisplayName, getUserInitial } from "../../utils/userDisplay";

const EditProfileModal = ({ user, open, onClose, onSaved }) => {
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFullName(user?.fullName ?? "");
    setBio(user?.bio ?? "");
    setAvatarFile(null);
    setAvatarPreview("");
    setError("");
  }, [open, user]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const hasProfileChanges = useMemo(() => {
    const nextFullName = fullName.trim();
    const currentFullName = (user?.fullName ?? "").trim();
    const currentBio = user?.bio ?? "";

    return (
      nextFullName !== currentFullName ||
      bio !== currentBio ||
      Boolean(avatarFile)
    );
  }, [avatarFile, bio, fullName, user]);

  if (!open) {
    return null;
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setError("");
    setAvatarFile(file);
  };

  const handleSubmit = async () => {
    const trimmedFullName = fullName.trim();

    if (!trimmedFullName) {
      setError("Full name is required.");
      return;
    }

    if (!hasProfileChanges) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      setError("");

      let updatedUser = { ...user };
      const profileChanged =
        trimmedFullName !== (user?.fullName ?? "").trim() || bio !== (user?.bio ?? "");

      if (profileChanged) {
        const profileResponse = await updateMyProfile({
          fullName: trimmedFullName,
          bio,
        });
        updatedUser = { ...updatedUser, ...profileResponse.user };
      }

      if (avatarFile) {
        const avatarResponse = await updateMyAvatar(avatarFile);
        updatedUser = { ...updatedUser, ...avatarResponse.data };
      }

      await onSaved(updatedUser);
      toast.success("Profile updated!");
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.message ?? "Failed to update profile. Try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const previewAvatar = avatarPreview || user?.avatarUrl || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1117] p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Edit profile</h2>
            <p className="mt-1 text-sm text-gray-400">
              Update your full name, bio, and profile picture.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            {previewAvatar ? (
              <img
                src={previewAvatar}
                alt={`${getDisplayName(user)} avatar`}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-xl font-semibold text-white">
                {getUserInitial(user)}
              </div>
            )}
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
            <Camera size={15} />
            Change photo
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-gray-500">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setError("");
              }}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-gray-500">
              Bio
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(event) => {
                setBio(event.target.value);
                setError("");
              }}
              placeholder="Tell people a little about yourself"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
