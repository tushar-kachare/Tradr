import API from "./axios";

export const createTrade = (payload) => API.post("/trades", payload);

export const getTradeById = async (tradeId) => {
    const res =  await API.get(`/trades/${tradeId}`);
    return res.data;
}

export const closeTradeById = async (tradeId) => {
    const res = await API.patch(`/trades/${tradeId}/close`);
    return res.data;
}

export const updateTradeById = async (tradeId , payLoad) => {
    const res = await API.patch(`/trades/${tradeId}` , payLoad);
    console.log(res.data);
    
    return res.data;
}
