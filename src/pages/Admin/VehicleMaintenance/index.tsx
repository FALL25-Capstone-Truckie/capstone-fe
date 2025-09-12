import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, App, Typography, Tag, DatePicker, Select, Input, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, ToolOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../../../services';
import type { VehicleMaintenance, Vehicle } from '../../../models';
import EntityManagementLayout from '../../../components/features/admin/EntityManagementLayout';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import MaintenanceForm from './components/MaintenanceForm';

dayjs.extend(isBetween);

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

const VehicleMaintenancePage: React.FC = () => {
    const [maintenances, setMaintenances] = useState<VehicleMaintenance[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<VehicleMaintenance | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
    const { message } = App.useApp();
    const navigate = useNavigate();

    const fetchMaintenances = async () => {
        try {
            setIsFetching(true);
            const response = await vehicleService.getVehicleMaintenances();
            if (response.success) {
                setMaintenances(response.data || []);
            } else {
                // Không phải lỗi, chỉ là không có dữ liệu
                setMaintenances([]);
            }
        } catch (error) {
            console.error('Error fetching vehicle maintenances:', error);
            message.error('Không thể tải danh sách bảo trì phương tiện');
            setMaintenances([]);
        } finally {
            setLoading(false);
            setIsFetching(false);
        }
    };

    const fetchVehicles = async () => {
        try {
            const response = await vehicleService.getVehicles();
            if (response.success) {
                setVehicles(response.data || []);
            } else {
                // Không phải lỗi, chỉ là không có dữ liệu
                setVehicles([]);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            setVehicles([]);
        }
    };

    useEffect(() => {
        fetchMaintenances();
        fetchVehicles();
    }, []);

    const handleOpenCreateModal = () => {
        setSelectedMaintenance(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (maintenance: VehicleMaintenance) => {
        setSelectedMaintenance(maintenance);
        setIsModalOpen(true);
    };

    const handleViewDetails = (id: string) => {
        navigate(`/admin/vehicle-maintenances/${id}`);
    };

    const handleFormSubmit = async (values: any) => {
        try {
            if (selectedMaintenance) {
                // Cập nhật bảo trì
                const response = await vehicleService.updateVehicleMaintenance(selectedMaintenance.id, {
                    ...values,
                    maintenanceDate: values.maintenanceDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                    nextMaintenanceDate: values.nextMaintenanceDate ? values.nextMaintenanceDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : undefined
                });

                if (response.success) {
                    message.success('Cập nhật lịch bảo trì thành công');
                    setIsModalOpen(false);
                    fetchMaintenances();
                } else {
                    // Không phải lỗi, chỉ là không tìm thấy bản ghi để cập nhật
                    message.warning(response.message || 'Không tìm thấy lịch bảo trì để cập nhật');
                }
            } else {
                // Tạo mới bảo trì
                const response = await vehicleService.createVehicleMaintenance({
                    ...values,
                    maintenanceDate: values.maintenanceDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                    nextMaintenanceDate: values.nextMaintenanceDate ? values.nextMaintenanceDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : undefined
                });

                if (response.success) {
                    message.success('Thêm lịch bảo trì thành công');
                    setIsModalOpen(false);
                    fetchMaintenances();
                } else {
                    message.warning(response.message || 'Không thể thêm lịch bảo trì');
                }
            }
        } catch (error) {
            console.error('Error submitting maintenance form:', error);
            message.error('Có lỗi xảy ra khi lưu thông tin bảo trì');
        }
    };

    const handleVehicleFilterChange = (value: string | null) => {
        setSelectedVehicle(value);
    };

    const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        setDateRange(dates);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const handleRefresh = () => {
        fetchMaintenances();
    };

    const filteredMaintenances = maintenances.filter(maintenance => {
        // Lọc theo phương tiện
        if (selectedVehicle && maintenance.vehicleId !== selectedVehicle) {
            return false;
        }

        // Lọc theo khoảng thời gian
        if (dateRange && dateRange[0] && dateRange[1]) {
            const maintenanceDate = dayjs(maintenance.maintenanceDate);
            if (!maintenanceDate.isBetween(dateRange[0], dateRange[1], null, '[]')) {
                return false;
            }
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            return (
                maintenance.description.toLowerCase().includes(searchLower) ||
                maintenance.serviceCenter.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    const getVehicleInfo = (vehicleId: string) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return vehicle ? `${vehicle.licensePlateNumber} - ${vehicle.model}` : vehicleId;
    };

    const columns = [
        {
            title: 'Phương tiện',
            key: 'vehicle',
            render: (record: VehicleMaintenance) => getVehicleInfo(record.vehicleId),
        },
        {
            title: 'Ngày bảo trì',
            dataIndex: 'maintenanceDate',
            key: 'maintenanceDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Chi phí',
            dataIndex: 'cost',
            key: 'cost',
            render: (cost: number) => `${cost.toLocaleString('vi-VN')} VND`,
        },
        {
            title: 'Trung tâm dịch vụ',
            dataIndex: 'serviceCenter',
            key: 'serviceCenter',
        },
        {
            title: 'Ngày bảo trì tiếp theo',
            dataIndex: 'nextMaintenanceDate',
            key: 'nextMaintenanceDate',
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : 'Chưa xác định',
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: VehicleMaintenance) => (
                <Space size="middle">
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record.id)}
                        title="Xem chi tiết"
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEditModal(record)}
                        title="Chỉnh sửa"
                    />
                </Space>
            ),
        },
    ];

    const renderFilters = () => (
        <Row gutter={16} className="mb-4">
            <Col xs={24} md={8} lg={6}>
                <Select
                    placeholder="Lọc theo phương tiện"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={handleVehicleFilterChange}
                    options={vehicles.map(vehicle => ({
                        value: vehicle.id,
                        label: `${vehicle.licensePlateNumber} - ${vehicle.model}`
                    }))}
                />
            </Col>
            <Col xs={24} md={8} lg={8}>
                <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['Từ ngày', 'Đến ngày']}
                    onChange={handleDateRangeChange}
                    format="DD/MM/YYYY"
                />
            </Col>
            <Col xs={24} md={8} lg={10}>
                <Search
                    placeholder="Tìm kiếm theo mô tả, trung tâm dịch vụ"
                    onSearch={handleSearch}
                    enterButton
                />
            </Col>
        </Row>
    );

    const renderModal = () => (
        <Modal
            title={selectedMaintenance ? 'Chỉnh sửa lịch bảo trì' : 'Thêm lịch bảo trì mới'}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            maskClosable={false}
            width={700}
        >
            <MaintenanceForm
                initialValues={selectedMaintenance}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsModalOpen(false)}
                vehicles={vehicles}
            />
        </Modal>
    );

    const pastMaintenances = maintenances.filter(m => {
        const maintenanceDate = dayjs(m.maintenanceDate);
        return maintenanceDate.isBefore(dayjs());
    });

    const upcomingMaintenances = maintenances.filter(m => {
        const maintenanceDate = dayjs(m.maintenanceDate);
        return maintenanceDate.isAfter(dayjs());
    });

    return (
        <EntityManagementLayout
            title="Quản lý bảo trì phương tiện"
            icon={<ToolOutlined />}
            description="Quản lý lịch bảo trì phương tiện trong hệ thống"
            addButtonText="Thêm lịch bảo trì"
            addButtonIcon={<PlusOutlined />}
            onAddClick={handleOpenCreateModal}
            searchText={searchText}
            onSearchChange={setSearchText}
            onRefresh={handleRefresh}
            isLoading={loading}
            isFetching={isFetching}
            totalCount={maintenances.length}
            activeCount={upcomingMaintenances.length}
            bannedCount={pastMaintenances.length}
            tableTitle="Danh sách lịch bảo trì"
            tableComponent={
                <>
                    {renderFilters()}
                    <Table
                        dataSource={filteredMaintenances}
                        columns={columns}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        loading={loading}
                    />
                </>
            }
            modalComponent={renderModal()}
        />
    );
};

export default VehicleMaintenancePage; 