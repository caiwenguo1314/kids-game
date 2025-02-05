import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import Home from './pages/Home/index';
import MemoryGame from './pages/MemoryGame/index';
import MazeGame from './pages/MazeGame/index';
import './App.css';

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className="layout">
        <Header style={{ padding: 0 }}>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['/']}
            items={[
              {
                key: '/',
                label: <Link to="/">首页</Link>,
              },
              {
                key: '/memory',
                label: <Link to="/memory">记忆游戏</Link>,
              },
              {
                key: '/maze',
                label: <Link to="/maze">迷宫游戏</Link>,
              },
            ]}
          />
        </Header>
        <Content className="site-content">
          <div className="content-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/memory" element={<MemoryGame />} />
              <Route path="/maze" element={<MazeGame />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
