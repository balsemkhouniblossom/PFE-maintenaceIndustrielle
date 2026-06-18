'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiService } from '@/services/api';
import { useTranslations } from 'next-intl';

interface Capteur {
  _id?: string;
  capteur_id?: string;
  nom_capteur?: string;
  type_capteur?: string;
  machine_id?: { machine_id?: string };
}

export default function CapteursPage() {
  const t = useTranslations('capteurs');
  const [capteurs, setCapteurs] = useState<Capteur[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCapteurs() {
    try {
      const response = await apiService.getCapteurs();
      setCapteurs(response.data);
    } catch (error) {
      console.error('Error loading capteurs:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCapteurs();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title={t('pageTitle')}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('pageTitle')}>
      <div className="bento-grid">
        {/* Header */}
        <div className="col-span-full mb-6 bento-item">
          <div className="panel">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{t('heading')}</h1>
                <p className="text-slate-600 mt-1">{t('description')}</p>
              </div>
              <div className="text-end">
                <div className="text-3xl font-bold text-blue-600">{capteurs.length}</div>
                <div className="text-sm text-slate-500">{t('totalSensors')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Capteurs Table */}
        <div className="col-span-full bento-item panel">
          <div className="card-title">{t('allSensors')}</div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('table.sensorId')}</th>
                  <th>{t('table.name')}</th>
                  <th>{t('table.type')}</th>
                  <th>{t('table.machine')}</th>
                  <th>{t('table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {capteurs.map((capteur: Capteur) => (
                  <tr key={capteur._id}>
                    <td>{capteur.capteur_id || capteur._id}</td>
                    <td>{capteur.nom_capteur || t('na')}</td>
                    <td>{capteur.type_capteur || t('na')}</td>
                    <td>{capteur.machine_id?.machine_id || t('na')}</td>
                    <td>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        {t('active')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
