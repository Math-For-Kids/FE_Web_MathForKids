import api from "./Api";

export const countAllGN = async () => {
  try {
    const response = await api.get(`/generalnotification/countAll`);
    return response.data;
  } catch (error) {
    console.error("Error counting general notification:", error);
    return [];
  }
};

export const getAllGN = async (pageSize, startAfterId) => {
  try {
    const response = await api.get(`/generalnotification/getAll`, {
      params: {
        pageSize,
        startAfterId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching general notification:", error);
    return [];
  }
};
