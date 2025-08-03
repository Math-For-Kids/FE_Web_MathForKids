import api from "./Api";

export const getPointStatsByLessons = async (
  grade,
  type,
  startDate,
  endDate
) => {
  try {
    const response = await api.get("/test/getPointStatsByLessons", {
      params: {
        grade,
        type,
        startDate,
        endDate,
      },
    });
    return response.data; // Đây sẽ là mảng lesson đã map từ Firestore
  } catch (error) {
    console.error("Error fetching points statistic:", error);
    return [];
  }
};

export const getPointStatsByGrade = async (grade, startDate, endDate) => {
  try {
    const response = await api.get("/test/getPointStatsByGrade", {
      params: {
        grade,
        startDate,
        endDate,
      },
    });
    return response.data; // Đây sẽ là mảng lesson đã map từ Firestore
  } catch (error) {
    console.error("Error fetching points statistic:", error);
    return [];
  }
};

export const rankingByGrade = async (grade) => {
  try {
    const response = await api.get(`/test/rankingByGrade/${grade}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ranking statistic:", error);
    return [];
  }
};
