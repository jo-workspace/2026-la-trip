'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Link as LinkIcon } from 'lucide-react';
import { getApiToken, getScriptUrl, setApiToken, setScriptUrl } from '@/lib/gas-client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [token, setToken] = useState('');
  const [url, setUrl] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setToken(getApiToken());
      setUrl(getScriptUrl());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiToken(token.trim());
    if (showUrlField && url.trim()) {
      setScriptUrl(url.trim());
    }
    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <Key className="w-5 h-5 text-slate-700" />
            <span>API 連線與認證設定</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              認證金鑰 (API Token / 暗號)
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="無設定金鑰請留空"
              className="w-full bg-slate-50 border border-slate-200 text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              若您的 Google Apps Script 後端有開啟 Token 認證，請在此輸入暗號。
            </p>
          </div>

          {showUrlField ? (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Apps Script Web App API 網址
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-mono"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlField(true)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 underline flex items-center space-x-1 cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>進階：自訂 Web App API 網址</span>
            </button>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all cursor-pointer"
            >
              儲存變更
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
