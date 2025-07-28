import { createContext, useEffect, useState } from "react";
import api from "../assets/api/Api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUserData = async () => {
    const userId = localStorage.getItem("userID");
    if (userId) {
      try {
        const res = await api.get(`/user/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, reloadUser: fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};
