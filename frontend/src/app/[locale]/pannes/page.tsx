'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import { Modal } from '@/components/Modal';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Panne {
  _id: string;
  panne_id: string;
  code_panne: string;
  description: string;
  gravite?: string;
}

const CUSTOM_OPTION = '__custom__';

export default function PannesPage() {
  const t = useTranslations('pannes');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { user } = useAuth();
  const isOperator = user?.role === 'operator';

  const [pannes, setPannes] = useState<Panne[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPanne, setEditingPanne] = useState<Panne | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    panne_id: '',
    code_panne: '',
    description: '',
    gravite: '',
    details: '',
  });
  const [customMode, setCustomMode] = useState({
    panne_id: false,
    code_panne: false,
    description: false,
    gravite: false,
  });

  async function loadData() {
    try {
      const response = await apiService.getPannes();
      setPannes(response.data || []);
    } catch (error) {
      console.error('Error loading pannes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshPannes() {
    await loadData();
    router.refresh();
    window.dispatchEvent(new Event('pannes:changed'));
  }

  function showNotification(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }

  const filteredPannes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return pannes;

    return pannes.filter(
      (panne) =>
        (panne.panne_id ?? '').toLowerCase().includes(term) ||
        (panne.code_panne ?? '').toLowerCase().includes(term) ||
        (panne.description ?? '').toLowerCase().includes(term) ||
        (panne.gravite ?? '').toLowerCase().includes(term),
    );
  }, [pannes, searchTerm]);

  const panneTemplates = useMemo(() => {
    const byId = new Map<string, Panne>();
    pannes.forEach((panne) => {
      if (panne?.panne_id) byId.set(panne.panne_id, panne);
    });
    return Array.from(byId.values()).sort((a, b) => a.panne_id.localeCompare(b.panne_id));
  }, [pannes]);

  const gravityOptions = ['Trouble (Probleme)', 'Warning (Avertissement)'];

  function applyPanneTemplate(selectedPanneId: string) {
    const template = panneTemplates.find((item) => item.panne_id === selectedPanneId);
    if (!template) {
      setFormData((prev) => ({ ...prev, panne_id: selectedPanneId }));
      return;
    }

    setFormData({
      panne_id: template.panne_id ?? '',
      code_panne: template.code_panne ?? '',
      description: template.description ?? '',
      gravite: template.gravite ?? '',
      details: '',
    });
  }

  function resetForm() {
    setFormData({
      panne_id: '',
      code_panne: '',
      description: '',
      gravite: '',
      details: '',
    });
    setCustomMode({
      panne_id: false,
      code_panne: false,
      description: false,
      gravite: false,
    });
    setEditingPanne(null);
  }

  function validateForm(): boolean {
    if (!formData.panne_id.trim()) {
      showNotification('error', t('notifications.panneIdRequired'));
      return false;
    }
    if (!formData.code_panne.trim()) {
      showNotification('error', t('notifications.codeRequired'));
      return false;
    }
    if (!formData.description.trim()) {
      showNotification('error', t('notifications.descriptionRequired'));
      return false;
    }
    return true;
  }

  function openCreateModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(panne: Panne) {
    setEditingPanne(panne);
    setFormData({
      panne_id: panne.panne_id ?? '',
      code_panne: panne.code_panne ?? '',
      description: panne.description ?? '',
      gravite: panne.gravite ?? '',
      details: '',
    });
    setCustomMode({
      panne_id: false,
      code_panne: false,
      description: false,
      gravite: false,
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm(t('notifications.confirmDelete'))) return;

    try {
      await apiService.deletePanne(id);
      await refreshPannes();
      showNotification('success', t('notifications.deleted'));
    } catch (error) {
      console.error('Error deleting panne:', error);
      showNotification('error', t('notifications.deleteFailed'));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const descriptionWithDetails = formData.details.trim()
        ? `${formData.description.trim()}\nDetails: ${formData.details.trim()}`
        : formData.description.trim();

      const payload: Record<string, unknown> = {
        panne_id: formData.panne_id.trim(),
        code_panne: formData.code_panne.trim(),
        description: descriptionWithDetails,
      };

      if (formData.gravite.trim()) payload.gravite = formData.gravite.trim();

      if (editingPanne) {
        await apiService.updatePanne(editingPanne._id, payload);
        showNotification('success', t('notifications.updated'));
      } else {
        await apiService.createPanne(payload);
        showNotification('success', t('notifications.created'));
      }

      setShowModal(false);
      resetForm();
      await refreshPannes();
    } catch (error) {
      console.error('Error saving panne:', error);
      showNotification('error', t('notifications.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleChanged = () => {
      loadData();
    };

    window.addEventListener('pannes:changed', handleChanged);
    window.addEventListener('focus', handleChanged);

    return () => {
      window.removeEventListener('pannes:changed', handleChanged);
      window.removeEventListener('focus', handleChanged);
    };
  }, []);

  if (loading) {
    return (
      <DashboardLayout title={t('title')}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('title')}>
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
            notification.type === 'success'
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
          <button onClick={() => setNotification(null)} className="ml-2 text-gray-500 hover:text-gray-700" title={tCommon('close')}>
            x
          </button>
        </div>
      )}

      <div className="bento-grid">
        <div className="col-span-full mb-6 bento-item">
          <div className="panel">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{t('heading')}</h1>
                <p className="text-slate-600 mt-1">{t('description')}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-end">
                  <div className="text-3xl font-bold text-blue-600">{pannes.length}</div>
                  <div className="text-sm text-slate-500">{t('totalPannes')}</div>
                </div>
                <button onClick={openCreateModal} className="btn-primary flex items-center space-x-2">
                  <PlusIcon className="w-4 h-4" />
                  <span>{t('actions.add')}</span>
                </button>
              </div>
            </div>

            <div className="mt-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchPlaceholder')}
                title={t('searchPlaceholder')}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
        </div>

        <div className="col-span-full bento-item panel">
          <div className="card-title">{t('allPannes')}</div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('table.panneId')}</th>
                  <th>{t('table.code')}</th>
                  <th>{t('table.description')}</th>
                  <th>{t('table.severity')}</th>
                  <th>{tCommon('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPannes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      {searchTerm ? t('empty.search') : t('empty.default')}
                    </td>
                  </tr>
                ) : (
                  filteredPannes.map((panne) => (
                    <tr key={panne._id}>
                      <td className="font-medium">{panne.panne_id}</td>
                      <td>{panne.code_panne}</td>
                      <td>{panne.description}</td>
                      <td>{panne.gravite || tCommon('notAvailable')}</td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(panne)}
                            className="btn-secondary p-2"
                            title={t('actions.edit')}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(panne._id)}
                            className="btn-danger p-2"
                            title={t('actions.delete')}
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

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingPanne ? t('modal.edit') : t('modal.add')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1">{t('form.panneId')}</label>
              {isOperator ? (
                <select
                  value={formData.panne_id}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue === CUSTOM_OPTION) {
                      setCustomMode((prev) => ({ ...prev, panne_id: true }));
                      setFormData((prev) => ({ ...prev, panne_id: '' }));
                      return;
                    }
                    setCustomMode((prev) => ({ ...prev, panne_id: false }));
                    applyPanneTemplate(selectedValue);
                  }}
                  className="input-field"
                  title={t('form.panneId')}
                  required
                >
                  <option value="">{t('form.panneId')}</option>
                  <option value={CUSTOM_OPTION}>Custom value...</option>
                  {panneTemplates.map((panne) => (
                    <option key={panne._id} value={panne.panne_id}>
                      {panne.panne_id}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.panne_id}
                  onChange={(e) => setFormData({ ...formData, panne_id: e.target.value })}
                  className="input-field"
                  title={t('form.panneId')}
                  required
                />
              )}
              {isOperator && customMode.panne_id && (
                <input
                  type="text"
                  value={formData.panne_id}
                  onChange={(e) => setFormData({ ...formData, panne_id: e.target.value })}
                  className="input-field mt-2"
                  title={t('form.panneId')}
                  placeholder="Custom panne ID"
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1">{t('form.code')}</label>
              {isOperator ? (
                <select
                  value={formData.code_panne}
                  onChange={(e) => {
                    if (e.target.value === CUSTOM_OPTION) {
                      setCustomMode((prev) => ({ ...prev, code_panne: true }));
                      setFormData((prev) => ({ ...prev, code_panne: '' }));
                      return;
                    }
                    setCustomMode((prev) => ({ ...prev, code_panne: false }));
                    const template = panneTemplates.find((item) => item.code_panne === e.target.value);
                    if (template) applyPanneTemplate(template.panne_id);
                  }}
                  className="input-field"
                  title={t('form.code')}
                  required
                >
                  <option value="">{t('form.code')}</option>
                  <option value={CUSTOM_OPTION}>Custom value...</option>
                  {panneTemplates.map((panne) => (
                    <option key={`${panne._id}-code`} value={panne.code_panne}>
                      {panne.code_panne}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.code_panne}
                  onChange={(e) => setFormData({ ...formData, code_panne: e.target.value })}
                  className="input-field"
                  title={t('form.code')}
                  required
                />
              )}
              {isOperator && customMode.code_panne && (
                <input
                  type="text"
                  value={formData.code_panne}
                  onChange={(e) => setFormData({ ...formData, code_panne: e.target.value })}
                  className="input-field mt-2"
                  title={t('form.code')}
                  placeholder="Custom code"
                  required
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-dark mb-1">{t('form.description')}</label>
            {isOperator ? (
              <select
                value={formData.description}
                onChange={(e) => {
                  if (e.target.value === CUSTOM_OPTION) {
                    setCustomMode((prev) => ({ ...prev, description: true }));
                    setFormData((prev) => ({ ...prev, description: '' }));
                    return;
                  }
                  setCustomMode((prev) => ({ ...prev, description: false }));
                  const template = panneTemplates.find((item) => item.description === e.target.value);
                  if (template) applyPanneTemplate(template.panne_id);
                }}
                className="input-field"
                title={t('form.description')}
                required
              >
                <option value="">{t('form.description')}</option>
                <option value={CUSTOM_OPTION}>Custom value...</option>
                {panneTemplates.map((panne) => (
                  <option key={`${panne._id}-description`} value={panne.description}>
                    {panne.description}
                  </option>
                ))}
              </select>
            ) : (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                title={t('form.description')}
                rows={3}
                required
              />
            )}
            {isOperator && customMode.description && (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field mt-2"
                title={t('form.description')}
                rows={3}
                placeholder="Custom description"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-dark mb-1">{t('form.severity')}</label>
            <select
              value={formData.gravite}
              onChange={(e) => {
                if (e.target.value === CUSTOM_OPTION) {
                  setCustomMode((prev) => ({ ...prev, gravite: true }));
                  setFormData((prev) => ({ ...prev, gravite: '' }));
                  return;
                }
                setCustomMode((prev) => ({ ...prev, gravite: false }));
                setFormData({ ...formData, gravite: e.target.value });
              }}
              className="input-field"
              title={t('form.severity')}
            >
              <option value="">{t('form.severity')}</option>
              <option value={CUSTOM_OPTION}>Custom value...</option>
              {gravityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {customMode.gravite && (
              <input
                type="text"
                value={formData.gravite}
                onChange={(e) => setFormData({ ...formData, gravite: e.target.value })}
                className="input-field mt-2"
                title={t('form.severity')}
                placeholder="Custom severity"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-dark mb-1">Additional details (optional)</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="input-field"
              rows={3}
              title="Additional details"
              placeholder="Add any extra context you want to keep with this record"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              {tCommon('cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting
                ? tCommon('saving')
                : editingPanne
                ? tCommon('actions.update')
                : tCommon('actions.create')}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
