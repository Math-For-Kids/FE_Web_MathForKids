import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Select, Modal, Table, Switch } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaBook, FaPlus, FaMinus, FaTimes, FaDivide, FaBookOpen, FaArrowsAlt } from 'react-icons/fa';
import api from '../../assets/api/Api';
import Navbar from '../../component/Navbar';
import './lesson.css';

const { Option } = Select;

const Lesson = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [lessonsData, setLessonsData] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState(1);
    const [filterType, setFilterType] = useState('addition');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [countAll, setCountAll] = useState('');
    const [visibleLesson, setVisibleLesson] = useState([]);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [isDragEnabled, setIsDragEnabled] = useState(false); // New state for drag toggle
    const { t, i18n } = useTranslation(['lesson', 'common']);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const lessonsPerPage = 100;

    const lessonTypes = useMemo(() => [
        { value: 'addition', label: t('addition'), icon: <FaPlus className="icon-type" />, color: '#60D56C' },
        { value: 'subtraction', label: t('subtraction'), icon: <FaMinus className="icon-type" />, color: '#B526E4' },
        { value: 'multiplication', label: t('multiplication'), icon: <FaTimes className="icon-type" />, color: '#F73A7A' },
        { value: 'division', label: t('division'), icon: <FaDivide className="icon-type" />, color: '#FD8550' },
    ], [t]);


    const fetchGradeType = useCallback(async (grade, type, token = null) => {
        try {
            let url = `/lesson/getAll?pageSize=${lessonsPerPage}&type=${type}&grade=${grade}`;
            if (token) url += `&startAfterId=${token}`;
            const response = await api.get(url);
            const newLessons = response.data.data || [];
            const responses = await api.get(`/lesson/countAll?type=${type}&grade=${grade}`);
            setCountAll(Number(responses.data.count));
            setLessonsData((prev) => {
                const existingIds = new Set(prev.map((lesson) => lesson.id));
                const uniqueNewLessons = newLessons.filter((lesson) => !existingIds.has(lesson.id));
                return [...prev, ...uniqueNewLessons];
            });
            setVisibleLesson((prev) => {
                const existingIds = new Set(prev.map((lesson) => lesson.id));
                const uniqueNewLessons = newLessons.filter((lesson) => !existingIds.has(lesson.id));
                return [...prev, ...uniqueNewLessons];
            });
            setNextPageToken(response.data.nextPageToken || null);
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language], { position: 'top-right', autoClose: 3000 });
        }
    }, [i18n.language]);

    const fetchFilterLessonDisabled = useCallback(async (grade, type, token = null, isDisabled) => {
        try {
            let url = `/lesson/filterByDisabled?pageSize=${lessonsPerPage}&type=${type}&grade=${grade}&isDisabled=${isDisabled}`;
            if (token) url += `&startAfterId=${token}`;
            const response = await api.get(url);
            const newLessons = response.data.data || [];
            const responses = await api.get(`/lesson/countByDisabledStatus?type=${type}&grade=${grade}&isDisabled=${isDisabled}`);
            setCountAll(Number(responses.data.count));
            setLessonsData((prev) => {
                const existingIds = new Set(prev.map((lesson) => lesson.id));
                const uniqueNewLessons = newLessons.filter((lesson) => !existingIds.has(lesson.id));
                return [...prev, ...uniqueNewLessons];
            });
            setVisibleLesson((prev) => {
                const existingIds = new Set(prev.map((lesson) => lesson.id));
                const uniqueNewLessons = newLessons.filter((lesson) => !existingIds.has(lesson.id));
                return [...prev, ...uniqueNewLessons];
            });
            // Cena: 0
            setNextPageToken(response.data.nextPageToken || null);
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language], { position: 'top-right', autoClose: 3000 });
        }
    }, [i18n.language]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setVisibleLesson(lessonsData);
        } else {
            const filtered = lessonsData.filter(
                (lesson) => lesson.name?.[i18n.language]?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setVisibleLesson(filtered);
        }
    }, [searchQuery, lessonsData, i18n.language]);

    useEffect(() => {
        const fetchLessons = async () => {
            setVisibleLesson([]);
            setLessonsData([]);
            setNextPageToken(null);
            if (filterStatus !== 'all') {
                await fetchFilterLessonDisabled(selectedGrade, filterType, null, filterStatus);
            } else {
                await fetchGradeType(selectedGrade, filterType, null);
            }
        };
        fetchLessons();
    }, [selectedGrade, filterType, filterStatus, fetchGradeType, fetchFilterLessonDisabled]);

    const loadMore = useCallback(async () => {
        if (!nextPageToken) return;
        try {
            if (filterStatus !== 'all') {
                await fetchFilterLessonDisabled(selectedGrade, filterType, nextPageToken, filterStatus);
            } else {
                await fetchGradeType(selectedGrade, filterType, nextPageToken);
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language], { position: 'top-right', autoClose: 3000 });
        }
    }, [nextPageToken, selectedGrade, filterType, filterStatus, fetchGradeType, fetchFilterLessonDisabled, i18n.language]);

    const handleSave = useCallback(async () => {
        if (validateForm()) {
            try {
                const { id, ...payload } = editingLesson;
                payload.name = {
                    vi: editingLesson.name?.vi || '',
                    en: editingLesson.name?.en || '',
                };
                payload.grade = Number(payload.grade);
                payload.type = editingLesson.type;

                if (editingLesson?.id) {
                    // Kiểm tra xem type hoặc grade có thay đổi không
                    const originalLesson = lessonsData.find((lesson) => lesson.id === editingLesson.id);
                    const isTypeChanged = originalLesson.type !== payload.type;
                    const isGradeChanged = originalLesson.grade !== payload.grade;

                    if (isTypeChanged || isGradeChanged) {
                        // Lấy danh sách bài học cho type và grade mới để tìm order lớn nhất
                        const response = await api.get(`/lesson/getAll?pageSize=${lessonsPerPage}&type=${payload.type}&grade=${payload.grade}`);
                        const lessons = response.data.data || [];
                        const maxOrder = lessons.length > 0 ? Math.max(...lessons.map(lesson => lesson.order || 0)) : 0;
                        payload.order = maxOrder + 1; // Gán order mới cho bài học được cập nhật
                    } else {
                        // Giữ nguyên order hiện tại nếu type và grade không thay đổi
                        payload.order = editingLesson.order;
                    }

                    await api.patch(`/lesson/${editingLesson.id}`, payload);
                    toast.success(t('updateSuccess', { ns: 'common' }), { position: 'top-right', autoClose: 2000 });
                } else {
                    // Đối với bài học mới, gán order dựa trên order lớn nhất trong nhóm
                    let maxOrder = 0;
                    const response = await api.get(`/lesson/getAll?pageSize=${lessonsPerPage}&type=${payload.type}&grade=${payload.grade}`);
                    const lessons = response.data.data || [];
                    if (lessons.length > 0) {
                        maxOrder = Math.max(...lessons.map(lesson => lesson.order || 0));
                    }
                    payload.order = maxOrder + 1;
                    await api.post(`/lesson`, payload);
                    toast.success(t('addSuccess', { ns: 'common' }), { position: 'top-right', autoClose: 2000 });
                }

                // Làm mới danh sách bài học
                setLessonsData([]);
                setVisibleLesson([]);
                setNextPageToken(null);
                if (filterStatus !== 'all') {
                    await fetchFilterLessonDisabled(selectedGrade, filterType, null, filterStatus);
                } else {
                    await fetchGradeType(selectedGrade, filterType, null);
                }
                closeModal();
            } catch (error) {
                toast.error(error.response?.data?.message?.[i18n.language], { position: 'top-right', autoClose: 3000 });
            }
        } else {
            toast.error(t('validationFailed', { ns: 'common' }), { position: 'top-right', autoClose: 2000 });
        }
    }, [editingLesson, selectedGrade, filterType, filterStatus, fetchGradeType, fetchFilterLessonDisabled, i18n.language, t, lessonsData]);

    const handleToggleAvailable = useCallback(async (lesson) => {
        try {
            const updatedLesson = { ...lesson, isDisabled: !lesson.isDisabled };
            await api.patch(`/lesson/${lesson.id}`, { ...updatedLesson, isDisabled: updatedLesson.isDisabled });
            toast.success(t('updateSuccess', { ns: 'common' }), { position: 'top-right', autoClose: 2000 });
            setLessonsData((prev) =>
                prev.map((e) => (e.id === lesson.id ? { ...e, isDisabled: !lesson.isDisabled } : e))
            );
        } catch (error) {
            toast.error(error.response?.data?.message?.[i18n.language], { position: 'top-right', autoClose: 3000 });
        }
    }, [i18n.language, t]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!editingLesson?.name?.vi || editingLesson.name.vi.trim() === '') {
            newErrors.nameVi = t('nameViRequired');
        } else if (editingLesson.name.vi.trim().length < 3) {
            newErrors.nameVi = t('nameViMinLength');
        }
        if (!editingLesson?.name?.en || editingLesson.name.en.trim() === '') {
            newErrors.nameEn = t('nameEnRequired');
        } else if (editingLesson.name.en.trim().length < 3) {
            newErrors.nameEn = t('nameEnMinLength');
        }
        if (!editingLesson?.grade || editingLesson.grade === '') {
            newErrors.grade = t('gradeRequired');
        } else if (!['1', '2', '3'].includes(String(editingLesson.grade))) {
            newErrors.grade = t('gradeInvalid');
        }
        if (!editingLesson?.type || editingLesson.type === '') {
            newErrors.type = t('typeRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [editingLesson, t]);

    const openModal = useCallback((mode, lesson = null) => {
        if (mode === 'add') {
            setEditingLesson({ name: { en: '', vi: '' }, grade: '', type: '' });
        } else if (mode === 'update') {
            setEditingLesson(lesson);
        }
        setIsModalOpen(true);
    }, []);

    const handleViewExercises = useCallback((lessonId) => {
        navigate(`/exercise/getByLesson/${lessonId}`);
    }, [navigate]);

    const handleLessonDetail = useCallback((lessonId) => {
        navigate(`/lessondetail/${lessonId}`);
    }, [navigate]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setErrors({});
    }, []);

    const handleDragEnd = useCallback(async (result) => {
        if (!result.destination) return;

        const reorderedLessons = Array.from(visibleLesson);
        const [movedLesson] = reorderedLessons.splice(result.source.index, 1);
        reorderedLessons.splice(result.destination.index, 0, movedLesson);

        const updatedLessons = reorderedLessons.map((lesson, index) => ({
            ...lesson,
            order: index + 1,
        }));

        setVisibleLesson(updatedLessons);
        setLessonsData(updatedLessons);

        try {
            const updatePromises = updatedLessons.map((lesson) =>
                api.patch(`/lesson/order/${lesson.id}`, { order: lesson.order })
            );
            await Promise.all(updatePromises);
            toast.success(t('updateOrderSuccess', { ns: 'common' }), { position: 'top-right', autoClose: 2000 });
        } catch (error) {
            toast.error(t('updateOrderFailed', { ns: 'common' }), { position: 'top-right', autoClose: 3000 });
            setVisibleLesson(lessonsData);
        }
    }, [visibleLesson, lessonsData, t]);

    const toggleDrag = useCallback(() => {
        setIsDragEnabled((prev) => !prev);
    }, []);

    const columns = useMemo(() => [
        {
            title: t('.no', { ns: 'common' }),
            dataIndex: 'order',
            key: 'order',
            width: 100,
        },
        {
            title: t('lessonName'),
            dataIndex: 'name',
            key: 'name',
            render: (name) => name?.[i18n.language] || '',
        },
        {
            title: t('type'),
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            render: (type) => {
                const lessonType = lessonTypes.find((t) => t.value === type);
                return (
                    <span style={{ color: lessonType?.color, fontSize: '20px' }}>
                        {lessonType?.icon || type}
                    </span>
                );
            },
        },
        {
            title: t('grade'),
            dataIndex: 'grade',
            key: 'grade',
            align: 'center',
        },
        {
            title: t('action', { ns: 'common' }),
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className="buttonaction">
                    <button
                        className="text-white px-3 py-1 buttonupdate"
                        onClick={() => openModal('update', record)}
                    >
                        <FaEdit className="iconupdate" />
                        {t('update', { ns: 'common' })}
                    </button>
                    <button
                        className="text-white px-3 py-1 buttondetail"
                        onClick={() => handleViewExercises(record.id)}
                    >
                        <FaBook className="iconupdate" />
                        {t('exercises')}
                    </button>
                    <button
                        className="text-white px-3 py-1 buttonlessondetail"
                        onClick={() => handleLessonDetail(record.id)}
                    >
                        <FaBookOpen className="iconupdate" />
                        {t('detail')}
                    </button>
                </div>
            ),
        },
        {
            title: t('available', { ns: 'common' }),
            dataIndex: 'isDisabled',
            key: 'isDisabled',
            align: 'center',
            render: (isDisabled, record) => (
                <Switch
                    checked={!isDisabled}
                    onChange={() => handleToggleAvailable(record)}
                    className="custom-switch"
                />
            ),
        },
    ], [t, i18n.language, lessonTypes, openModal, handleViewExercises, handleLessonDetail, handleToggleAvailable]);

    return (
        <div className="containers">
            {/* <Navbar /> */}
            <div className="title-search">
                <h1 className="container-title">{t('managementLessons')}</h1>
                <div className="search">
                    <Input
                        type="text"
                        className="inputsearch"
                        placeholder={t('searchPlaceholder', { ns: 'common' })}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="containers-content">
                <div className="filter-bar mb-2">
                    <div className="filter-containers">
                        <span className="filter-icon">
                            <svg
                                className="iconfilter"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                            </svg>
                            <button className="filter-text">{t('filterBy', { ns: 'common' })}</button>
                        </span>
                        <Select
                            className="filter-dropdown"
                            value={filterType}
                            onChange={(value) => setFilterType(value)}
                            placeholder={t('type')}
                        >
                            {lessonTypes.map((type) => (
                                <Select.Option key={type.value} value={type.value}>{type.label}</Select.Option>
                            ))}
                        </Select>
                        <Select
                            className="filter-dropdown"
                            value={selectedGrade}
                            onChange={(value) => setSelectedGrade(value)}
                            placeholder={t('grade')}
                        >
                            <Select.Option value="1">{t('grade')} 1</Select.Option>
                            <Select.Option value="2">{t('grade')} 2</Select.Option>
                            <Select.Option value="3">{t('grade')} 3</Select.Option>
                        </Select>
                        <Select
                            className="filter-dropdown"
                            value={filterStatus}
                            onChange={(value) => setFilterStatus(value)}
                            placeholder={t('lessonStatus')}
                        >
                            <Select.Option value="all">{t('status', { ns: 'common' })}</Select.Option>
                            <Select.Option value="false">{t('no', { ns: 'common' })}</Select.Option>
                            <Select.Option value="true">{t('yes', { ns: 'common' })}</Select.Option>
                        </Select>
                    </div>
                    <div className="button-group">
                        <Button
                            className={`rounded-toggle-drag ${isDragEnabled ? 'active' : ''}`}
                            onClick={toggleDrag}
                        >
                            <FaArrowsAlt style={{ marginRight: '8px' }} />
                            {isDragEnabled ? t('disableDrag') : t('enableDrag')}
                        </Button>
                        <Button className="rounded-add" onClick={() => openModal('add')}>
                            + {t('addNew', { ns: 'common' })}
                        </Button>
                    </div>
                </div>

                <div className="table-container-lesson">
                    {isDragEnabled ? (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="lessons">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={snapshot.isDraggingOver ? 'dragging-over' : ''}
                                    >
                                        <Table
                                            columns={columns}
                                            dataSource={visibleLesson}
                                            pagination={false}
                                            rowKey="id"
                                            className="custom-table"
                                            components={{
                                                body: {
                                                    row: ({ children, ...props }) => {
                                                        const index = visibleLesson.findIndex((lesson) => lesson.id === props['data-row-key']);
                                                        return (
                                                            <Draggable draggableId={props['data-row-key']} index={index}>
                                                                {(provided, snapshot) => (
                                                                    <tr
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        {...props}
                                                                        className={snapshot.isDragging ? 'dragging' : ''}
                                                                        style={{
                                                                            ...provided.draggableProps.style,
                                                                            ...(snapshot.isDragging ? { backgroundColor: '#f0f0f0', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' } : {}),
                                                                        }}
                                                                    >
                                                                        {children}
                                                                    </tr>
                                                                )}
                                                            </Draggable>
                                                        );
                                                    },
                                                },
                                            }}
                                        />
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={visibleLesson}
                            pagination={false}
                            rowKey="id"
                            className="custom-table"
                        />
                    )}
                    <div className="paginations">
                        {nextPageToken && visibleLesson.length < countAll ? (
                            <Button className="load-more-btn" onClick={loadMore}>
                                {t('More', { ns: 'common' })}
                            </Button>
                        ) : null}
                    </div>
                </div>

                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {editingLesson?.id ? t('updateLesson') : t('addLesson')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className="form-content-lesson">
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('lessonName')} (Vietnamese) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input
                                placeholder={t('inputlessonNameVi')}
                                value={editingLesson?.name?.vi || ''}
                                onChange={(e) =>
                                    setEditingLesson({
                                        ...editingLesson,
                                        name: { ...editingLesson?.name, vi: e.target.value },
                                    })
                                }
                            />
                            {errors.nameVi && <div className="error-text">{errors.nameVi}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('lessonName')} (English) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Input
                                placeholder={t('inputlessonNameEn')}
                                value={editingLesson?.name?.en || ''}
                                onChange={(e) =>
                                    setEditingLesson({
                                        ...editingLesson,
                                        name: { ...editingLesson?.name, en: e.target.value },
                                    })
                                }
                            />
                            {errors.nameEn && <div className="error-text">{errors.nameEn}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('grade')} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('inputgrade')}
                                value={editingLesson?.grade || undefined}
                                onChange={(value) => setEditingLesson({ ...editingLesson, grade: value })}
                            >
                                <Select.Option value="1">{t('grade')} 1</Select.Option>
                                <Select.Option value="2">{t('grade')} 2</Select.Option>
                                <Select.Option value="3">{t('grade')} 3</Select.Option>
                            </Select>
                            {errors.grade && <div className="error-text">{errors.grade}</div>}
                        </div>
                        <div className="inputtext">
                            <label className="titleinput">
                                {t('type')} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('inputType')}
                                value={editingLesson?.type || undefined}
                                onChange={(value) => setEditingLesson({ ...editingLesson, type: value })}
                            >
                                {lessonTypes.map((type) => (
                                    <Select.Option key={type.value} value={type.value}>
                                        {type.label}
                                    </Select.Option>
                                ))}
                            </Select>
                            {errors.type && <div className="error-text">{errors.type}</div>}
                        </div>
                    </div>
                    <div className="button-row">
                        <Button className="cancel-button" onClick={closeModal} block>
                            {t('cancel', { ns: 'common' })}
                        </Button>
                        <Button className="save-button" onClick={handleSave} block>
                            {t('save', { ns: 'common' })}
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default Lesson;
