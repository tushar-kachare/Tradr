const ComingSoonPage = ({ icon: Icon, title, message, accent = "blue" }) => {
  const accentClasses = {
    blue: "from-blue-500/20 to-cyan-400/10 text-blue-300 border-blue-500/30",
    amber: "from-amber-500/20 to-yellow-400/10 text-amber-300 border-amber-500/30",
    violet:
      "from-violet-500/20 to-fuchsia-400/10 text-violet-300 border-violet-500/30",
  };

  const tone = accentClasses[accent] || accentClasses.blue;

  return (
    <section className="min-h-full flex items-center justify-center px-4 py-16">
      <div className={`w-full max-w-xl rounded-lg border bg-gradient-to-br ${tone} p-8 text-center`}>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
          {Icon && <Icon size={30} />}
        </div>

        <h1 className="mb-3 text-3xl font-bold text-white">{title}</h1>

        <p className="text-base leading-7 text-gray-300">{message}</p>
      </div>
    </section>
  );
};

export default ComingSoonPage;
