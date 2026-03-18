'use client';

import { Switch, Tooltip, Space } from 'antd';
import { useTheme } from './theme-provider';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Space size="middle" align="center">
            <Tooltip title={`Theme: ${theme}`}>
                <Switch
                    checked={theme === 'dark'}
                    onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    checkedChildren="Dark"
                    unCheckedChildren="Light"
                />
            </Tooltip>

        </Space>
    );
}