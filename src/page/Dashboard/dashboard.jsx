import Navbar from "../../component/Navbar";
import { useState, useEffect } from "react";
import api from '../../assets/api/Api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import "./dashboard.css"; // Import file CSS
const months = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const Dashboard = () => {
  const [selectedUserMonth, setSelectedUserMonth] = useState("05"); // Separate state for user month
  const [selectedPupilMonth, setSelectedPupilMonth] = useState("05"); // Separate state for pupil month
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [studentsByGrade, setStudentsByGrade] = useState(0);
  const [usersByMonth, setUsersByMonth] = useState({ current: 0, previous: 0 });
  const [pupilsByMonth, setPupilsByMonth] = useState({ current: 0, previous: 0 });

  // Fetch data from APIs when component mounts or month selections change
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total users
        const userResponse = await api.get("/user/countuser");
        setTotalUsers(userResponse.data.count || 0);

        // Fetch total students
        const studentResponse = await api.get("/pupil/countpupil");
        setTotalStudents(studentResponse.data.count || 0);

        // Fetch total lessons
        const lessonResponse = await api.get("/lesson/countlesson");
        setTotalLessons(lessonResponse.data.count || 0);

        // Fetch students by grade
        const gradeResponse = await api.get("/pupil/countbygrade");
        setStudentsByGrade(gradeResponse.data.count || 0);

        // Fetch users by month for selected user month
        let usersByMonthData = { current: 0, previous: 0 };
        try {
          const monthResponse = await api.get(`/user/countusersbymonth?month=${selectedUserMonth}`);
          usersByMonthData = {
            current: monthResponse.data.currentMonthCount || 0,
            previous: monthResponse.data.previousMonthCount || 0,
          };
        } catch (userError) {
          console.warn(`Pupil data fetch failed for month ${selectedUserMonth}:`, userError.message);
        }
        setUsersByMonth(usersByMonthData);

        // Fetch pupils by month for selected pupil month
        let pupilsByMonthData = { current: 0, previous: 0 };
        try {
          const monthPupilsResponse = await api.get(`/pupil/countpupilsbymonth?month=${selectedPupilMonth}`);
          pupilsByMonthData = {
            current: monthPupilsResponse.data.currentMonthCount || 0,
            previous: monthPupilsResponse.data.previousMonthCount || 0,
          };
        } catch (pupilError) {
          console.warn(`Pupil data fetch failed for month ${selectedPupilMonth}:`, pupilError.message);
        }
        setPupilsByMonth(pupilsByMonthData);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedUserMonth, selectedPupilMonth]); // Re-fetch when either month changes

  // Calculate trend for Total Users
  const userTrend = usersByMonth.previous > 0
    ? ((usersByMonth.current - usersByMonth.previous) / usersByMonth.previous * 100).toFixed(1)
    : 0;
  const userTrendDirection = userTrend >= 0 ? "up" : "down";

  // Placeholder trends for other cards
  const studentTrend = "1.3";
  const studentTrendDirection = "up";
  const gradeTrend = "-4.3";
  const gradeTrendDirection = "down";
  const lessonTrend = "1.8";
  const lessonTrendDirection = "up";

  return (
    <div className="container">
      <Navbar />
      <div className="container-contentunqie">
        <h1 className="container-title">Dashboard</h1>

        {/* Statistics Cards */}
        <div className="stats-container">
          {/* Card 1: Total User */}
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">Total User</h3>
                  <p className="card-value">{totalUsers.toLocaleString()}</p>
                  <p className={`card-trend ${userTrendDirection}`}>
                    <span className="trend-icon">{userTrendDirection === "up" ? "↑" : "↓"}</span>
                    {Math.abs(userTrend)}% {userTrendDirection} from yesterday
                  </p>
                </div>
                <div className="card-icon" style={{ backgroundColor: "#dbeafe" }}>
                  <svg
                    className="w-6 h-6"
                    fill="#93c5fd"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="card-footer footer-yellow">
              <p>Total User</p>
            </div>
          </div>



          {/* Card 2: Total Student */}
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">Total Student</h3>
                  <p className="card-value">{totalStudents.toLocaleString()}</p>
                  <p className={`card-trend ${studentTrendDirection}`}>
                    <span className="trend-icon">{studentTrendDirection === "up" ? "↑" : "↓"}</span>
                    {studentTrend}% Up from past week
                  </p>
                </div>
                <div className="card-icon" style={{ backgroundColor: "#fef3c7" }}>
                  <svg
                    className="w-6 h-6"
                    fill="#fcd34d"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="card-footer footer-red">
              <p>Total Student</p>
            </div>
          </div>

          {/* Card 3: Students by Grade */}
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">Students by Grade</h3>
                  <p className="card-value">{studentsByGrade.toLocaleString()}</p>
                  <p className={`card-trend ${gradeTrendDirection}`}>
                    <span className="trend-icon">{gradeTrendDirection === "up" ? "↑" : "↓"}</span>
                    {Math.abs(gradeTrend)}% Down from past week
                  </p>
                </div>
                <div className="card-icon" style={{ backgroundColor: "#d1fae5" }}>
                  <svg
                    className="w-6 h-6"
                    fill="#34d399"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="card-footer footer-blue">
              <p>Students by Grade</p>
            </div>
          </div>

          {/* Card 4: Total Lessons */}
          <div className="card-container">
            <div className="card-main">
              <div className="card-inner">
                <div className="card-content">
                  <h3 className="card-title">Total Lessons</h3>
                  <p className="card-value">{totalLessons.toLocaleString()}</p>
                  <p className={`card-trend ${lessonTrendDirection}`}>
                    <span className="trend-icon">{lessonTrendDirection === "up" ? "↑" : "↓"}</span>
                    {lessonTrend}% Up from past week
                  </p>
                </div>
                <div className="card-icon" style={{ backgroundColor: "#fed7aa" }}>
                  <svg
                    className="w-6 h-6"
                    fill="#fb923c"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332-.477-4.5-1.253"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="card-footer footer-green">
              <p>Total Lessons</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-container">
          {/* Chart 1: Statistics User */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">STATISTICS USER</h3>
              <select
                value={selectedUserMonth}
                onChange={(e) => setSelectedUserMonth(e.target.value)}
                className="month-select"
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: "Previous", value: usersByMonth.previous },
                { name: "Current", value: usersByMonth.current },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 30]} ticks={[0, 10, 20, 30]} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Statistics Student */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">STATISTICS STUDENT</h3>
              <select
                value={selectedPupilMonth}
                onChange={(e) => setSelectedPupilMonth(e.target.value)}
                className="month-select"
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { name: "Previous", value: pupilsByMonth.previous },
                { name: "Current", value: pupilsByMonth.current },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Dashboard;