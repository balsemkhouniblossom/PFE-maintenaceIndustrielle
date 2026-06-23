'use client';
import React from 'react';
import { Modal } from '@/components/Modal';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import DashboardLayout from '@/components/DashboardLayout';
import DynamicSearchControls from '@/components/DynamicSearchControls';
import { apiService } from '@/services/api';
import { ALL_FIELDS_TOKEN, getSearchableFields, matchesDynamicSearch } from '@/services/dynamicSearch';
import { useRouter } from 'next/navigation';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  user_id?: string;
  nom_complet?: string;
  email?: string;
  role?: string;
  department?: string;
  phone?: string;
  photo?: string;
  is_active?: boolean;
  last_login?: string;
}

export default function UsersPage() {
  const tUsers = useTranslations('users');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSearchField, setSelectedSearchField] = useState(ALL_FIELDS_TOKEN);
  const [submitting, setSubmitting] = useState(false);
  //const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // placeholder modal (no create/edit implemented yet)
  //const [showModal, setShowModal] = useState(false);
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://pfe-maintenaceindustrielle.onrender.com';
  const emptyForm = {
    user_id: '',
    nom_complet: '',
    email: '',
    password: '',
    role: 'operator',
    department: '',
    phone: '',
    photo: '',
    is_active: true,
  };
  const departmentOptions = ['IT', 'Maintenance', 'Production', 'Administration'];
  const CUSTOM_DEPARTMENT_VALUE = '__custom_department__';

  const [formData, setFormData] = useState(emptyForm);
  const [useCustomDepartment, setUseCustomDepartment] = useState(false);

  function resetForm() {
    setFormData(emptyForm);
    setUseCustomDepartment(false);
    setEditingUser(null);
  }
  function showNotification(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);

    return () => clearTimeout(timer);

  }

  async function refreshUsers() {
    await loadUsers();
    router.refresh();
    window.dispatchEvent(new Event('users:changed'));
  }

  function handleAdd() {
    resetForm();
    setIsModalOpen(true);
  }

  function validateForm() {
    if (!formData.nom_complet.trim()) {
      showNotification('error', tUsers('validation.nameRequired'));
      return false;
    }
    if (!formData.email.trim()) {
      showNotification('error', tUsers('validation.emailRequired'));
      return false;
    }
    if (!editingUser && !formData.password.trim()) {
      showNotification('error', 'Password is required');
      return false;
    }
    return true;
  }

  function handleEdit(user: User) {
    const existingDepartment = user.department || '';
    const isCustomDepartment = !!existingDepartment && !departmentOptions.includes(existingDepartment);

    setEditingUser(user);
    setUseCustomDepartment(isCustomDepartment);
    setFormData({
      user_id: user.user_id || '',
      nom_complet: user.nom_complet || '',
      email: user.email || '',
      password: '',
      role: user.role || 'operator',
      department: existingDepartment,
      phone: user.phone || '',
      photo: user.photo || '',
      is_active: user.is_active ?? true,
    });
    setIsModalOpen(true);
  }

  // ADD THIS HERE
  async function handlePhotoUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const uploadData = new FormData();

      uploadData.append('photo', file);

      const response = await apiService.uploadPhoto(uploadData);

      setFormData((prev) => ({
        ...prev,
        photo: response.data.photoPath,
      }));

      showNotification('success', tUsers('notifications.photoUploaded'));
    } catch (error) {
      console.error(error);
      showNotification('error', tUsers('notifications.photoUploadFailed'));
    }
  }
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (editingUser) {
        const payload = { ...formData };

        if (!payload.password?.trim()) {
          delete (payload as Partial<typeof payload>).password;
        }

        await apiService.updateUser(editingUser._id, payload);
        showNotification('success', tUsers('notifications.updated'));
      } else {
        const payload = {
          ...formData,
          
        };
        await apiService.createUser(payload);
         showNotification('success', tUsers('notifications.created'));
      }

      setIsModalOpen(false);
      resetForm();
      await refreshUsers();
    } catch (err) {
      console.error('Save error:', err);
      showNotification('error', tUsers('notifications.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  }
  async function loadUsers() {
    setLoading(true);
    try {
      const res = await apiService.getUsers();
      setUsers(res.data);
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification('error', tUsers('notifications.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleUsersChanged = () => {
      loadUsers();
    };

    window.addEventListener('users:changed', handleUsersChanged);
    window.addEventListener('focus', handleUsersChanged);

    return () => {
      window.removeEventListener('users:changed', handleUsersChanged);
      window.removeEventListener('focus', handleUsersChanged);
    };
  }, []);

  const searchableFields = useMemo(
    () => getSearchableFields(users, { exclude: ['photo'] }),
    [users],
  );

  const filteredUsers = useMemo(
    () => users.filter((u) => matchesDynamicSearch(u, searchTerm, selectedSearchField)),
    [users, searchTerm, selectedSearchField],
  );

  async function handleDelete(userId?: string) {
    if (!userId) return;
    const ok = confirm(
      tUsers('notifications.confirmDelete', {
        default: 'Are you sure you want to delete?',
      })
    );
    if (!ok) return;

    try {
      await apiService.deleteUser(userId);
      await refreshUsers();
      showNotification(
        'success',
        tUsers('notifications.deleted', { default: 'User deleted' })
      );
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification(
        'error',
        tUsers('notifications.deleteFailed', { default: 'Failed to delete user' })
      );
    }
  }

  if (loading) {
    return (
      <DashboardLayout title={tUsers('pageTitle', { default: 'Users' })}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={tUsers('pageTitle', { default: 'Users' })}>
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${notification.type === 'success'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
            }`}
        >
          {notification.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="bento-grid">
        <div className="col-span-full mb-6 bento-item">
          <div className="panel">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{tUsers('heading', { default: 'Users' })}</h1>
                <p className="text-slate-600 mt-1">
                  {tUsers('subtitle', { default: 'Manage system users' })}
                </p>              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{filteredUsers.length}</div>
                  <div className="text-sm text-slate-500">
                    {tUsers('totalUsers', { default: 'Total users' })}
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>{tUsers('addUser', { default: 'Add user' })}</span>
                </button>
              </div>
            </div>

            <DynamicSearchControls
              selectedField={selectedSearchField}
              onSelectedFieldChange={setSelectedSearchField}
              searchableFields={searchableFields}
              allFieldsLabel={tCommon('table.allFields', { default: 'All fields' })}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              searchPlaceholder={tUsers('searchPlaceholder', { default: 'Search users...' })}
            />
          </div>
        </div>

        <div className="col-span-full bento-item panel">
          <div className="card-title">{tUsers('allUsers', { default: 'All users' })}</div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>{tUsers('table.photo', { default: 'Photo' })}</th>
                  <th>{tUsers('table.userId', { default: 'User ID' })}</th>
                  <th>{tUsers('table.name', { default: 'Name' })}</th>
                  <th>{tUsers('table.email', { default: 'Email' })}</th>
                  <th>{tUsers('table.role', { default: 'Role' })}</th>
                  <th>{tUsers('table.department', { default: 'Department' })}</th>
                  <th>{tUsers('table.phone', { default: 'Phone' })}</th>
                  <th>{tUsers('table.status', { default: 'Status' })}</th>
                  <th>{tUsers('table.lastLogin', { default: 'Last Login' })}</th>
                  <th>{tCommon('table.actions', { default: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-500">
                      {searchTerm
                        ? tUsers('empty.search', { default: 'No users match your search.' })
                        : tUsers('empty.default', { default: 'No users found.' })}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        {u.photo ? (
                          <img
                            src={`${BACKEND_URL}${u.photo}`}
                            alt={u.nom_complet}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            {u.nom_complet?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>

                      <td>{u.user_id ?? '-'}</td>

                      <td>{u.nom_complet ?? '-'}</td>

                      <td>{u.email ?? '-'}</td>

                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'technician'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {tUsers(`roles.${u.role}`)}
                        </span>
                      </td>

                      <td>{u.department || '-'}</td>

                      <td>{u.phone || '-'}</td>

                      <td>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${u.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {tUsers(`status.${u.is_active ? 'active' : 'inactive'}`)}
                        </span>
                      </td>

                      <td>
                        {u.last_login
                          ? new Date(u.last_login).toLocaleString()
                          : '-'}
                      </td>

                      <td>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            aria-label={tUsers('actions.edit')}
                            title={tUsers('actions.edit')}
                            className="btn-secondary p-2"
                            onClick={() => handleEdit(u)}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            aria-label={tUsers('actions.delete')}
                            title={tUsers('actions.delete')}
                            className="btn-danger p-2"
                            onClick={() => handleDelete(u._id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={
          editingUser
            ? tUsers('modal.editTitle')
            : tUsers('modal.addTitle')
        } size="lg"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* PHOTO UPLOAD */}
          <div className="flex flex-col items-center gap-3">

            <label className="cursor-pointer">

              {formData.photo ? (
                <img
                  src={`${BACKEND_URL}${formData.photo}`}
                  alt={tUsers('form.profilePhoto')}
                  className="w-24 h-24 rounded-full object-cover border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-600">
                  {formData.nom_complet?.charAt(0).toUpperCase() || '?'}
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>

            <span className="text-sm text-slate-500">
              {tUsers('form.clickAvatar')}
            </span>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                {tUsers('form.userId')}
              </label>
              <input
                type="text"
                value={formData.user_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    user_id: e.target.value,
                  })
                }
                className="input-field"
                title={tUsers('form.userId')}
                placeholder={tUsers('form.userId')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {tUsers('form.fullName')}
              </label>
              <input
                type="text"
                value={formData.nom_complet}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nom_complet: e.target.value,
                  })
                }
                className="input-field"
                title={tUsers('form.fullName')}
                placeholder={tUsers('form.fullName')}
                required
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                {tUsers('form.email')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="input-field"
                title={tUsers('form.email')}
                placeholder={tUsers('form.email')}
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>

              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                className="input-field"
                title="Password"
                required={!editingUser}
                placeholder={editingUser ? tUsers('form.editPassword') : 'Password'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {tUsers('form.phone')}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                className="input-field"
                title={tUsers('form.phone')}
                placeholder={tUsers('form.phone')}
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                {tUsers('form.department')}
              </label>
              <select
                value={useCustomDepartment ? CUSTOM_DEPARTMENT_VALUE : formData.department}
                onChange={(e) => {
                  if (e.target.value === CUSTOM_DEPARTMENT_VALUE) {
                    setUseCustomDepartment(true);
                    setFormData({
                      ...formData,
                      department: '',
                    });
                    return;
                  }

                  setUseCustomDepartment(false);
                  setFormData({
                    ...formData,
                    department: e.target.value,
                  });
                }}
                className="input-field"
                title={tUsers('form.department')}
              >
                <option value="">{tUsers('form.department', { default: 'Department' })}</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
                <option value={CUSTOM_DEPARTMENT_VALUE}>Custom department...</option>
              </select>
              {useCustomDepartment && (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      department: e.target.value,
                    })
                  }
                  className="input-field mt-2"
                  title="Custom department"
                  placeholder="Enter custom department"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {tUsers('form.role')}
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
                  })
                }
                className="input-field"
                title={tUsers('form.role')}
              >
                <option value="admin">{tUsers('roles.admin')}</option>
                <option value="technician">{tUsers('roles.technician')}</option>
                <option value="operator">{tUsers('roles.operator')}</option>
              </select>
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {tUsers('form.status')}
            </label>

            <select
              value={formData.is_active ? 'true' : 'false'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_active: e.target.value === 'true',
                })
              }
              className="input-field"
              title={tUsers('form.status')}
            >
              <option value="true">{tUsers('status.active')}</option>
              <option value="false">{tUsers('status.inactive')}</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">

            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              {tCommon('actions.cancel')}
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>{tCommon('actions.saving')}</span>
                </div>
              ) : editingUser ? (
                tUsers('actions.updateUser')
              ) : (
                tUsers('actions.createUser')
              )}
            </button>

          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

