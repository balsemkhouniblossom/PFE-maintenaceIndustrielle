'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Modal } from '@/components/Modal';
import { apiService } from '@/services/api';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
interface Catalogue {
  _id: string;
  part_id: string;
  nom_piece: string;
  ref_constructeur: string;
  fabricant?: string;
  categorie_piece?: string;
  unit_price?: number;
  stock_quantity?: number;
  minimum_stock?: number;
  location?: string;
}

export default function CataloguesPage() {

  const t = useTranslations('catalogues');
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCatalogue, setEditingCatalogue] = useState<Catalogue | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({
    part_id: '',
    nom_piece: '',
    ref_constructeur: '',
    fabricant: '',
    categorie_piece: '',
    unit_price: '',
    stock_quantity: '',
    minimum_stock: '',
    location: '',
  });

  useEffect(() => {
    loadCatalogues();
  }, []);
  async function loadCatalogues() {
    try {
      const response = await apiService.getCatalogues();
      setCatalogues(response.data);
    } catch (error) {
      console.error('Error loading catalogues:', error);
    } finally {
      setLoading(false);
    }
  }


  const filteredCatalogues = useMemo(() => catalogues.filter(catalogue =>
    catalogue.part_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    catalogue.nom_piece.toLowerCase().includes(searchTerm.toLowerCase()) ||
    catalogue.ref_constructeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (catalogue.fabricant && catalogue.fabricant.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (catalogue.categorie_piece && catalogue.categorie_piece.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (catalogue.location && catalogue.location.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [catalogues, searchTerm]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateForm = () => {
    if (!formData.part_id.trim()) {
      showNotification('error', t('validation.partIdRequired'));
      return false;
    }
    if (!formData.nom_piece.trim()) {
      showNotification('error', t('validation.partNameRequired'));
      return false;
    }
    if (!formData.ref_constructeur.trim()) {
      showNotification('error', t('validation.manufacturerRefRequired'));
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      part_id: '',
      nom_piece: '',
      ref_constructeur: '',
      fabricant: '',
      categorie_piece: '',
      unit_price: '',
      stock_quantity: '',
      minimum_stock: '',
      location: '',
    });
    setEditingCatalogue(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (catalogue: Catalogue) => {
    setEditingCatalogue(catalogue);
    setFormData({
      part_id: catalogue.part_id,
      nom_piece: catalogue.nom_piece,
      ref_constructeur: catalogue.ref_constructeur,
      fabricant: catalogue.fabricant || '',
      categorie_piece: catalogue.categorie_piece || '',
      unit_price: catalogue.unit_price?.toString() || '',
      stock_quantity: catalogue.stock_quantity?.toString() || '',
      minimum_stock: catalogue.minimum_stock?.toString() || '',
      location: catalogue.location || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (catalogueId: string) => {
    if (confirm(t('messages.confirmDelete'))) {
      try {
        await apiService.deleteCatalogue(catalogueId);
        await loadCatalogues();
        showNotification('success', t('notifications.deleteSuccess'));
      } catch (error) {
        console.error('Error deleting catalogue:', error);
        showNotification('error', t('notifications.deleteError'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const data = {
        ...formData,
        unit_price: parseFloat(formData.unit_price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        minimum_stock: parseInt(formData.minimum_stock) || 0,
      };

      if (editingCatalogue) {
        await apiService.updateCatalogue(editingCatalogue._id, data);
        showNotification('success', t('notifications.updateSuccess'));
      } else {
        await apiService.createCatalogue(data);
        showNotification('success', t('notifications.createSuccess'));
      }

      setShowModal(false);
      resetForm();
      await loadCatalogues();
    } catch (error) {
      console.error('Error saving catalogue:', error);
      showNotification('error', t('notifications.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

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
    <DashboardLayout title={t('title')}>      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
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
        {/* Header */}
        <div className="col-span-full mb-6 bento-item">
          <div className="panel">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">  {t('header.title')}</h1>
                <p className="text-slate-600 mt-1">  {t('header.subtitle')}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{catalogues.length}</div>
                  <div className="text-sm text-slate-500">  {t('stats.totalParts')}</div>
                </div>
                <button
                  onClick={handleCreate}
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />[]
                  <span>  {t('actions.addPart')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Catalogues Table */}
        <div className="col-span-full bento-item panel">
          <div className="flex items-center justify-between mb-4">
            <div className="card-title">  {t('header.title')}</div>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('table.partId')}</th>
                  <th>{t('table.partName')}</th>
                  <th>{t('table.manufacturerRef')}</th>
                  <th>{t('table.manufacturer')}</th>
                  <th>{t('table.category')}</th>
                  <th>{t('table.stock')}</th>
                  <th>{t('table.unitPrice')}</th>
                  <th>{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCatalogues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      {searchTerm
                        ? t('messages.noSearchResults')
                        : t('messages.noParts')}                    </td>
                  </tr>
                ) : (
                  filteredCatalogues.map((part: Catalogue) => (
                    <tr key={part._id}>
                      <td className="font-medium">{part.part_id}</td>
                      <td>{part.nom_piece}</td>
                      <td>{part.ref_constructeur}</td>
                      <td>{part.fabricant || t('common.na')}</td>
                      <td>{part.categorie_piece || t('common.na')}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(part.stock_quantity || 0) <= (part.minimum_stock || 0) ? 'bg-red-100 text-red-800' :
                          (part.stock_quantity || 0) < (part.minimum_stock || 0) * 1.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {part.stock_quantity || 0}
                        </span>
                      </td>
                      <td>${part.unit_price?.toFixed(2) || '0.00'}</td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(part)}
                            className="btn-secondary p-2"
                            title={t('actions.edit')}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(part._id)}
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
        title={
          editingCatalogue
            ? t('modal.editTitle')
            : t('modal.createTitle')
        } size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1">
                {t('form.partId')}
              </label>
              <input
                type="text"
                value={formData.part_id}
                onChange={(e) => setFormData({ ...formData, part_id: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1">
                {t('form.partName')}
              </label>
              <input
                type="text"
                value={formData.nom_piece}
                onChange={(e) => setFormData({ ...formData, nom_piece: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1">
                {t('form.manufacturerReference')}
              </label>
              <input
                type="text"
                value={formData.ref_constructeur}
                onChange={(e) => setFormData({ ...formData, ref_constructeur: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1">
                {t('form.manufacturer')}
              </label>
              <input
                type="text"
                value={formData.fabricant}
                onChange={(e) => setFormData({ ...formData, fabricant: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1">
                {t('form.category')}
              </label>
              <input
                type="text"
                value={formData.categorie_piece}
                onChange={(e) => setFormData({ ...formData, categorie_piece: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1">
                {t('form.unitPrice')}
              </label>
              <input
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className="input-field"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1">
                {t('form.location')}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1">
                {t('form.stockQuantity')}
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="input-field"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1">
                {t('form.minimumStock')}
              </label>
              <input
                type="number"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                className="input-field"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              {t('actions.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('actions.saving')}</span>
                </div>
              ) : (
                editingCatalogue
                  ? t('actions.updatePart')
                  : t('actions.createPart')
              )}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
