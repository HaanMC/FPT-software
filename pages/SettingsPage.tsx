import React, { useRef } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { exportData, importData } from '../services/storageService';
import Button from '../components/Button';
import { Download, Upload } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { data, updateData } = useGlobal();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        if (ev.target?.result) importData(ev.target.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-lg">Timer Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="text-xs font-bold text-gray-500">Focus (min)</label>
                  <input type="number" value={data.settings.focusMinutes} onChange={e => updateData(p => ({...p, settings: {...p.settings, focusMinutes: +e.target.value}}))} className="w-full border p-2 rounded"/>
              </div>
              <div>
                  <label className="text-xs font-bold text-gray-500">Short Break (min)</label>
                  <input type="number" value={data.settings.shortBreakMinutes} onChange={e => updateData(p => ({...p, settings: {...p.settings, shortBreakMinutes: +e.target.value}}))} className="w-full border p-2 rounded"/>
              </div>
          </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-lg">Data Management</h2>
          <p className="text-sm text-gray-500">Export your progress to transfer devices or keep a backup.</p>
          <div className="flex gap-4">
              <Button onClick={exportData} variant="outline">
                  <span className="flex items-center"><Download size={16} className="mr-2"/> Export JSON</span>
              </Button>
              <div className="relative">
                  <Button onClick={() => fileRef.current?.click()} variant="outline">
                      <span className="flex items-center"><Upload size={16} className="mr-2"/> Import JSON</span>
                  </Button>
                  <input type="file" ref={fileRef} onChange={handleImport} accept=".json" className="hidden"/>
              </div>
          </div>
      </section>
      
      <div className="text-center text-xs text-gray-400">
          FocusLearn Plus v2.0
      </div>
    </div>
  );
};

export default SettingsPage;