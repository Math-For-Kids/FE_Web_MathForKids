import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { UserProvider } from "../contexts/UserContext"; // Thêm dòng này
import "./MainLayout.css";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  return (
    <UserProvider>
      <Layout style={{ minHeight: "100vh" }}>
        <Header style={{ padding: 0 }}>
          <Navbar />
        </Header>
        <Layout>
          <Sider width="265">
            <Sidebar />
          </Sider>
          <Content className="main-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </UserProvider>
  );
};

export default MainLayout;