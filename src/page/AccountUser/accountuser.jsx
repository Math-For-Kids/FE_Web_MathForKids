import { useState, useEffect } from 'react';
import './accountuser.css';
import Navbar from "../../component/Navbar";
import { Input, Button, Select, Modal, DatePicker, message } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FaMars, FaVenus, FaCrown, FaGraduationCap, FaUsers, FaUserGraduate, FaEdit } from 'react-icons/fa';
import api from '../../assets/api/Api';

const AccountUser = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [edittingUser, setEditingUser] = useState(null);
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all / enabled / disabled
    const [userData, setUserData] = useState([]);
    const [pupilData, setPupilData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    const { t, i18n } = useTranslation(['account', 'common']);
    const { Option } = Select;
    const userPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/user');
            const responsepupil = await api.get('/pupil');
            setUserData(response.data);
            setPupilData(responsepupil.data);
        } catch (error) {
            toast.error(t('errorFetchData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (validateForm()) {
            try {
                if (edittingUser?.id) {
                    await api.put(`/user/${edittingUser.id}`, edittingUser);
                    toast.success(t('updateSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                } else {
                    const response = await api.post(`/user`, edittingUser);
                    const newuser = response.data.id;
                    await api.put(`/user/${newuser}`, { isVerify: true });
                    toast.success(t('addSuccess', { ns: 'common' }), {
                        position: 'top-right',
                        autoClose: 2000,
                    });
                }
                fetchUsers();
                closeModal();
            } catch (error) {
                toast.error(t('errorSavingData', { ns: 'common' }), {
                    position: 'top-right',
                    autoClose: 2000,
                });
            }
        } else {
            toast.error(t('validationFailed', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const handleToggleDisabled = async (user) => {
        try {
            await api.put(`/user/${user.id}`, { isDisabled: !user.isDisabled });
            toast.success(t('updateSuccess', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
            fetchUsers();
        } catch {
            toast.error(t('errorSavingData', { ns: 'common' }), {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!edittingUser?.phoneNumber || !/^\d{10}$/.test(edittingUser.phoneNumber)) {
            newErrors.phoneNumber = t('numberPhoneRequired');
        }
        if (!edittingUser?.email || !/\S+@\S+\.\S+/.test(edittingUser.email)) {
            newErrors.email = t('emailRequired');
        }
        if (!edittingUser?.dateOfBirth || edittingUser.dateOfBirth === '') {
            newErrors.dateOfBirth = t('dateOfBirthRequired');
        } else {
            const dob = new Date(edittingUser.dateOfBirth);
            const now = new Date();
            if (dob > now) {
                newErrors.dateOfBirth = t('dateOfBirthdodRequired');
            } else {
                const ageDifMs = now - dob;
                const ageDate = new Date(ageDifMs);
                const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                if (age < 25) {
                    newErrors.dateOfBirth = t('dateOfBirtholdRequired');
                }
            }
        }
        if (!edittingUser?.address || edittingUser.address === '') {
            newErrors.address = t('addressRequired');
        }
        if (!edittingUser?.fullName || edittingUser.fullName === '') {
            newErrors.fullName = t('fullNameRequired');
        }
        if (!edittingUser?.gender || edittingUser.gender === '') {
            newErrors.gender = t('genderRequired');
        }
        if (!edittingUser?.role || edittingUser.role === '') {
            newErrors.role = t('roleRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatFirebaseTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return '';
        const date = new Date(timestamp.seconds * 1000);
        const day = String(date.getDate()).padStart

            (2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const openModal = (mode, user = null) => {
        if (mode === 'add') {
            setEditingUser(null);
        } else if (mode === 'update' && user) {
            let formattedDOB = '';
            if (user.dateOfBirth?.seconds) {
                formattedDOB = moment(user.dateOfBirth.seconds * 1000).format('YYYY/MM/DD');
            } else if (typeof user.dateOfBirth === 'string') {
                formattedDOB = moment(user.dateOfBirth).isValid() ? moment(user.dateOfBirth).format('YYYY/MM/DD') : '';
            }
            setEditingUser({ ...user, dateOfBirth: formattedDOB });
        }
        setIsModalOpen(true);
    };

    const openDetailModal = (user) => {
        const userPupils = pupilData.filter((pupil) => pupil.userId === user.id);
        setSelectedUserDetail({ ...user, children: userPupils });
        setDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedUserDetail(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
    };

    const filteredUsers = userData.filter(user => {
        const matchRole = selectedRole ? user.role === selectedRole : true;
        const matchStatus =
            filterStatus === 'all'
                ? true
                : filterStatus === 'no'
                    ? user.isDisabled === false
                    : user.isDisabled === true;
        return matchStatus && matchRole;
    });

    const indexOfLastUser = currentPage * userPerPage;
    const indexOfFirstUser = indexOfLastUser - userPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPage = Math.ceil(filteredUsers.length / userPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderGenderIcon = (gender) => {
        if (gender.toLowerCase() === 'male') {
            return <FaMars className="gender-icon" style={{ color: '#35A6FF' }} />;
        } else if (gender.toLowerCase() === 'female') {
            return <FaVenus className="gender-icon" style={{ color: '#FF1493' }} />;
        }
        return null;
    };

    const renderRoleIcon = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return <FaCrown className="role-icon" style={{ color: '#FFF82A' }} />;
            case 'pupil':
                return <FaGraduationCap className="role-icon" style={{ color: '#1EFF37' }} />;
            case 'user':
                return <FaUsers className="role-icon" style={{ color: '#9b59b6' }} />;
            default:
                return null;
        }
    };

    return (
        <div className="containers">
            <Navbar />
            <h1 className="container-title">{t('managementAccountUser')}</h1>
            <div className="containers-content">
                <div className="flex justify-between items-center mb-2">
                    <div className="filter-bar">
                        <div className="filter-container">
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
                                        strokeLinejoin="round">
                                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                                    </svg>
                                    <button className="filter-text">
                                        {t('filterBy', { ns: 'common' })}
                                    </button>
                                </span>
                                <select
                                    className="filter-dropdown"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="">{t('role')}</option>
                                    <option value="user">{t('roleUser')}</option>
                                    <option value="admin">{t('roleAdmin')}</option>
                                </select>
                                <select
                                    className="filter-dropdown"
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">{t('accountStatus')}</option>
                                    <option value="yes">{t('yes', { ns: 'common' })}</option>
                                    <option value="no">{t('no', { ns: 'common' })}</option>
                                </select>
                            </div>
                        </div>
                        <button
                            className="bg-blue-500 px-4 py-2 rounded-add"
                            onClick={() => openModal('add')}
                        >
                            + {t('addNew', { ns: 'common' })}
                        </button>
                    </div>
                </div>
                <div className="table-container-user">
                    <table className="w-full bg-white shadow-md rounded-lg">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="p-3">{t('.no', { ns: 'common' })}</th>
                                <th className="p-3">{t('fullName')}</th>
                                <th className="p-3">{t('email')}</th>
                                <th className="p-3">{t('numberPhone')}</th>
                                <th className="p-3 text-center">{t('gender')}</th>
                                <th className="p-3 text-center">{t('role')}</th>
                                <th className="p-3 text-center">{t('action', { ns: 'common' })}</th>
                                <th className="p-3 text-center">{t('available', { ns: 'common' })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user, index) => (
                                <tr key={user.id} className="border-t">
                                    <td className="p-3">{indexOfFirstUser + index + 1}</td>
                                    <td className="p-3">{user.fullName}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">{user.phoneNumber}</td>
                                    <td className="p-3 text-center">{renderGenderIcon(user.gender)}</td>
                                    <td className="p-3 text-center">{renderRoleIcon(user.role)}</td>

                                    <td className="p-3">
                                        <div className='buttonaction'>
                                            <button
                                                className="text-white px-3 py-1 buttonupdate"
                                                onClick={() => openModal('update', user)}>
                                                <FaEdit className='iconupdate' />
                                                {t('update', { ns: 'common' })}
                                            </button>
                                            <button
                                                className="text-white px-3 py-1 buttondetail"
                                                onClick={() => openDetailModal(user)}>
                                                <FaUserGraduate className='iconupdate' />
                                                {t('pupil')}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={user.isDisabled}
                                                onChange={() => handleToggleDisabled(user)}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-end items-center mt-4 ml-auto paginations">
                        <div className="pagination">
                            <button
                                className="around"
                                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                            {Array.from({ length: totalPage }, (_, index) => (
                                <button
                                    key={index + 1}
                                    className={`around ${currentPage === index + 1 ? 'active' : ''}`}
                                    onClick={() => paginate(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                className="around"
                                onClick={() => currentPage < totalPage && paginate(currentPage + 1)}
                                disabled={currentPage === totalPage}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>

                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {t('userdetail')}
                        </div>
                    }
                    open={detailModalOpen}
                    onCancel={closeDetailModal}
                    footer={null}
                    className="modal-content"
                >
                    {selectedUserDetail ? (
                        <div className="pupil-detail-content">
                            <div className="user-detail-section">
                                <div className="user-detail-row">
                                    <span className="user-detail-label">{t('fullName')}:</span>
                                    <span className="user-detail-value">{selectedUserDetail.fullName}</span>
                                </div>
                                <div className="user-detail-row">
                                    <span className="user-detail-label">{t('email')}:</span>
                                    <span className="user-detail-value">{selectedUserDetail.email}</span>
                                </div>
                                <div className="user-detail-row">
                                    <span className="user-detail-label">{t('numberPhone')}:</span>
                                    <span className="user-detail-value">{selectedUserDetail.phoneNumber}</span>
                                </div>
                                <div className="user-detail-row">
                                    <span className="user-detail-label">{t('dateOfBirth')}:</span>
                                    <span className="user-detail-value">{formatFirebaseTimestamp(selectedUserDetail.dateOfBirth)}</span>
                                </div>
                                <div className="user-detail-row">
                                    <span className="user-detail-label">{t('address')}:</span>
                                    <span className="user-detail-value">{selectedUserDetail.address}</span>
                                </div>
                                <div className="user-detail-row">
                                    <span className="user-detail-label">{t('gender')}:</span>
                                    <span className="user-detail-value">{renderGenderIcon(selectedUserDetail.gender)}
                                    </span>
                                </div>
                                <div className="user-detail-row">
                                    <span className="user-detail-label">{t('role')}:</span>
                                    <span className="user-detail-value"> {renderRoleIcon(selectedUserDetail.role)}
                                    </span>
                                </div>
                            </div>
                            <h3 style={{ textAlign: 'center', fontSize: '24px' }}>{t('pupil')}</h3>
                            {selectedUserDetail.children?.length > 0 ? (
                                <table className="w-full bg-white shadow-md rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-200 text-left">
                                            <th className="p-2">{t('no', { ns: 'common' })}</th>
                                            <th className="p-2">{t('image')}</th>
                                            <th className="p-2">{t('nickName')}</th>
                                            <th className="p-2">{t('dateOfBirth')}</th>
                                            <th className="p-2 text-center">{t('grade')}</ th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedUserDetail.children.map((child, index) => (
                                            <tr key={index} className="border-t">
                                                <td className="p-3">{indexOfFirstUser + index + 1}</td>
                                                <td className="p-3">
                                                    <img src={child.image || 'https://i.pravatar.cc/100'} alt={child.nickName} width="50" height="50" style={{ objectFit: 'cover', borderRadius: '50px', border: '2px solid #ccc' }} />
                                                </td>
                                                <td className="p-2">{child.nickName}</td>
                                                <td className="p-2">{formatFirebaseTimestamp(child.dateOfBirth)}</td>
                                                <td className="p-2 text-center">{child.grade}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>{t('noPupilProfile')}</p>
                            )}
                        </div>
                    ) : (
                        <p>{t('noUserData')}</p>
                    )}
                </Modal>

                <Modal
                    title={
                        <div style={{ textAlign: 'center', fontSize: '24px' }}>
                            {edittingUser?.id ? t('updateAccountUser') : t('addAccountUser')}
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={closeModal}
                    footer={null}
                    className="modal-content"
                >
                    <div className='form-content'>
                        <div className="inputtext">
                            <label className='titleinput'>{t('numberPhone')} <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('inputNumberPhone')}
                                value={edittingUser?.phoneNumber || ''}
                                onChange={(e) => setEditingUser({ ...edittingUser, phoneNumber: e.target.value })}
                            />
                            {errors.phoneNumber && <div className="error-text">{errors.phoneNumber}</div>}
                        </div>
                        <div className="inputtext">
                            <label className='titleinput'>{t('fullName')} <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('inputFullName')}
                                value={edittingUser?.fullName || ''}
                                onChange={(e) => setEditingUser({ ...edittingUser, fullName: e.target.value })}
                            />
                            {errors.fullName && <div className="error-text">{errors.fullName}</div>}
                        </div>
                        <div className="inputtext">
                            <label className='titleinput'>{t('address')} <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                placeholder={t('inputAddress')}
                                value={edittingUser?.address || ''}
                                onChange={(e) => setEditingUser({ ...edittingUser, address: e.target.value })}
                            />
                            {errors.address && <div className="error-text">{errors.address}</div>}
                        </div>
                        <div className="inputtext">
                            <label className='titleinput'>{t('email')} <span style={{ color: 'red' }}>*</span></label>
                            <Input
                                type="email"
                                placeholder={t('inputEmail')}
                                value={edittingUser?.email || ''}
                                onChange={(e) => setEditingUser({ ...edittingUser, email: e.target.value })}
                            />
                            {errors.email && <div className="error-text">{errors.email}</div>}
                        </div>
                        <div className="inputtext">
                            <label className='titleinput'>{t('dateOfBirth')} <span style={{ color: 'red' }}>*</span></label>
                            <DatePicker
                                placeholder={t('inputDateOfBirth')}
                                style={{ width: '100%', height: '50px' }}
                                defaultValue={moment()}
                                value={edittingUser?.dateOfBirth ? moment(edittingUser.dateOfBirth, 'YYYY/MM/DD') : null}
                                onChange={(date) => setEditingUser({ ...edittingUser, dateOfBirth: date ? date.format('YYYY/MM/DD') : '' })}
                            />
                            {errors.dateOfBirth && <div className="error-text">{errors.dateOfBirth}</div>}
                        </div>
                        <div className="inputtext">
                            <label className='titleinput'>{t('gender')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectionGender')}
                                value={edittingUser?.gender || undefined}
                                onChange={(value) => setEditingUser({ ...edittingUser, gender: value })}
                            >
                                <Option value="Male">{t('male')}</Option>
                                <Option value="Female">{t('female')}</Option>
                            </Select>
                            {errors.gender && <div className="error-text">{errors.gender}</div>}
                        </div>
                        <div className="inputtext">
                            <label className='titleinput'>{t('role')} <span style={{ color: 'red' }}>*</span></label>
                            <Select
                                style={{ width: '100%', height: '50px' }}
                                placeholder={t('selectionRole')}
                                value={edittingUser?.role || undefined}
                                onChange={(value) => setEditingUser({ ...edittingUser, role: value })}
                            >
                                <Option value="user">{t('roleUser')}</Option>
                                <Option value="admin">{t('roleAdmin')}</Option>
                            </Select>
                            {errors.role && <div className="error-text">{errors.role}</div>}
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

export default AccountUser;