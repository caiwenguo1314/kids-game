import React from 'react';
import { Card, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { PlayCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

function Home() {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
        儿童游戏中心
      </Title>
      <Space direction="horizontal" size="large" wrap style={{ justifyContent: 'center' }}>
        <Link to="/memory">
          <Card
            hoverable
            style={{ width: 240 }}
            cover={
              <div style={{ 
                height: 160, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '64px',
                color: '#1890ff'
              }}>
                <PlayCircleOutlined />
              </div>
            }
          >
            <Card.Meta
              title="记忆配对游戏"
              description="考验记忆力，找出相同的配对"
            />
          </Card>
        </Link>

        <Link to="/maze">
          <Card
            hoverable
            style={{ width: 240 }}
            cover={
              <div style={{ 
                height: 160, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '64px',
                color: '#1890ff'
              }}>
                <PlayCircleOutlined />
              </div>
            }
          >
            <Card.Meta
              title="迷宫游戏"
              description="在迷宫中找到正确的出路"
            />
          </Card>
        </Link>
      </Space>
    </div>
  );
}

export default Home;
