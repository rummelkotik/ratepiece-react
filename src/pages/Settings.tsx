import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { parseImportBackup } from '../lib/storage';
import { Download, Upload, Trash2, Moon, Sun, Heart, Copy, Check, X } from 'lucide-react';
import { Logo } from '../components/Logo';

export const Settings: React.FC = () => {
  const {
    settings,
    services,
    entries,
    setSettings,
    toggleTheme,
    importData,
    resetData,
  } = useStore();

  const [incomeGoalInput, setIncomeGoalInput] = useState<string>(String(settings.incomeGoal));
  const [taxRateInput, setTaxRateInput] = useState<string>(String(settings.taxRate));
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportJson, setExportJson] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal = Number(incomeGoalInput);
    const newTax = Number(taxRateInput);

    if (!Number.isFinite(newGoal) || newGoal < 0) {
      alert('Введите корректную цель по доходу (число >= 0)');
      return;
    }
    if (!Number.isFinite(newTax) || newTax < 0 || newTax > 100) {
      alert('Налог должен быть от 0 до 100%');
      return;
    }

    setSettings({ ...settings, incomeGoal: newGoal, taxRate: newTax });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadExport = () => {
    const backupData = { services, entries, settings, exportedAt: new Date().toISOString() };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `ratepiece-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Данные успешно экспортированы!');
  };

  const handleOpenExport = () => {
    const backupData = { services, entries, settings, exportedAt: new Date().toISOString() };
    setExportJson(JSON.stringify(backupData, null, 2));
    setCopied(false);
    setShowExportModal(true);
  };

  const handleCopyExport = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(exportJson);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = exportJson;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Не удалось скопировать автоматически.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const { services: impServices, entries: impEntries, settings: impSettings } = parseImportBackup(text);

        if (!impServices && !impEntries) {
          alert('Файл не содержит корректных данных');
          return;
        }

        if (impSettings && typeof impSettings === 'object') {
          setSettings(impSettings);
        }

        importData(impServices, impEntries);
        alert('Данные успешно импортированы!');
        window.location.reload();
      } catch (err) {
        alert('Ошибка импорта: ' + (err as Error).message);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleReset = () => {
    if (!window.confirm('Вы уверены? Все записи, расценки и настройки будут удалены безвозвратно.')) return;
    resetData();
    alert('Все данные были успешно сброшены.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-main font-heading">Настройки</h2>
        <p className="text-sm text-text-muted">Настройте приложение и управляйте вашими данными</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Settings Form */}
        <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <h3 className="text-base font-bold text-text-main font-heading">Основные настройки</h3>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-[#141414] text-[#FF7A00] flex items-center justify-center shrink-0">
                  {settings.theme === 'dark' ? <Moon className="w-5 h-5" strokeWidth={1.75} /> : <Sun className="w-5 h-5" strokeWidth={1.75} />}
                </div>
                <div>
                  <span className="text-sm font-semibold text-text-main block">Тёмная тема</span>
                  <span className="text-xs text-text-muted">{settings.theme === 'dark' ? 'Включена тёмная тема' : 'Включена светлая тема'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`relative inline-flex h-[20px] w-[40px] flex-shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors duration-300 focus:outline-none ${settings.theme === 'dark' ? 'bg-[#FF7A00]' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-md transition-transform duration-300 ${settings.theme === 'dark' ? 'translate-x-[20px]' : 'translate-x-0'}`} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Цель по доходу (на месяц)</label>
              <div className="relative">
                <input type="number" min="0" step="5000" value={incomeGoalInput} onChange={(e) => setIncomeGoalInput(e.target.value)} className="w-full bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-text-main rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent-orange pr-8 font-mono tabular-nums" />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted pointer-events-none select-none">₽</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Ставка налога (%)</label>
              <div className="relative">
                <input type="number" min="0" max="100" step="0.1" value={taxRateInput} onChange={(e) => setTaxRateInput(e.target.value)} className="w-full bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-text-main rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent-orange pr-8 font-mono tabular-nums" />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted pointer-events-none select-none">%</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#FF7A00] text-gray-950 font-bold py-3 px-5 rounded-full hover:opacity-95 active:scale-[0.99] transition-all shadow-md cursor-pointer">
              {saveSuccess ? '✓ Настройки сохранены!' : 'Сохранить настройки'}
            </button>
          </form>
        </div>

        {/* Data Management Card */}
        <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-text-main font-heading">Управление данными</h3>

            {/* Export row */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-[#141414] text-[#FF7A00] flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-text-main block">Экспорт данных</span>
                  <span className="text-xs text-text-muted">Скачать .json файл</span>
                </div>
              </div>
              <button type="button" onClick={handleDownloadExport} className="bg-[#FF7A00] text-gray-950 font-bold text-xs px-3.5 py-2 rounded-full hover:opacity-95 active:scale-95 transition-all shadow-sm cursor-pointer">
                Скачать
              </button>
            </div>

            {/* Import row */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-[#141414] text-text-main flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-text-main block">Импорт файла</span>
                  <span className="text-xs text-text-muted">Загрузить файл .json с устройства</span>
                </div>
              </div>
              <label className="bg-[#FF7A00] text-gray-950 font-bold text-xs px-4 py-2 rounded-full hover:opacity-95 active:scale-95 transition-all shadow-sm cursor-pointer inline-flex items-center justify-center">
                Выбрать файл
                <input type="file" accept=".json,application/json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>

            {/* Reset row */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-text-main block">Сброс данных</span>
                  <span className="text-xs text-text-muted">Очистить все сохранённые записи</span>
                </div>
              </div>
              <button type="button" onClick={handleReset} className="bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white font-semibold text-xs px-4 py-2 rounded-full active:scale-95 transition-all cursor-pointer">
                Сброс
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-text-main font-heading">Экспорт данных</h3>
              </div>
              <button type="button" onClick={() => setShowExportModal(false)} className="w-8 h-8 rounded-full text-gray-400 hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea readOnly value={exportJson} onFocus={(e) => e.target.select()} className="w-full h-48 bg-black/5 dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-text-main font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-accent-orange resize-none select-all" />
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button type="button" onClick={() => setShowExportModal(false)} className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-main rounded-full transition-colors cursor-pointer">Закрыть</button>
              <button type="button" onClick={handleCopyExport} className="bg-[#FF7A00] text-gray-950 font-bold text-xs px-5 py-2 rounded-full flex items-center gap-1.5 hover:opacity-95 active:scale-95 transition-all shadow-md cursor-pointer">
                {copied ? <><Check className="w-3.5 h-3.5" /> Скопировано!</> : <><Copy className="w-3.5 h-3.5" /> Скопировать</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Application Card */}
      <div className="bg-white border border-black/5 dark:bg-[#141414] dark:border-white/5 shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl sm:rounded-3xl p-6 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
          <Logo size={56} className="justify-center mb-1" />
          <h3 className="text-lg font-bold font-heading text-text-main tracking-tight">RatePiece</h3>
          <span className="inline-block bg-accent-orange/15 text-accent-orange text-xs font-semibold px-3 py-1 rounded-full">Версия 1.1.0 (React + TypeScript)</span>
          <p className="text-xs text-text-muted flex items-center justify-center gap-1 pt-1">Сделано с <Heart className="w-3.5 h-3.5 text-accent-orange fill-accent-orange" strokeWidth={1.5} /> для вашего удобства</p>
        </div>
      </div>
    </div>
  );
};