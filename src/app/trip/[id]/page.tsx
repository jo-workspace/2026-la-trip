'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { notFound } from 'next/navigation';
import { TRIPS, TripConfig } from '@/config/trips';
import { AllTripData, ItineraryItem, TodoItem, PackingItem, ShoppingItem } from '@/types/trip';
import { TabType, Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { Header } from '@/components/Header';

import { ItineraryTab } from '@/components/tabs/ItineraryTab';
import { TodoTab } from '@/components/tabs/TodoTab';
import { PackingTab } from '@/components/tabs/PackingTab';
import { ExpensesTab } from '@/components/tabs/ExpensesTab';
import { ShoppingTab } from '@/components/tabs/ShoppingTab';

import { ItineraryModal } from '@/components/modals/ItineraryModal';
import { TodoModal } from '@/components/modals/TodoModal';
import { PackingModal } from '@/components/modals/PackingModal';
import { ShoppingModal } from '@/components/modals/ShoppingModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { LightboxModal } from '@/components/modals/LightboxModal';

import {
  getAllData,
  saveItineraryData,
  deleteItineraryData,
  toggleVisitedStatus,
  saveTodoData,
  deleteTodoData,
  toggleTodoStatus,
  savePackingData,
  deletePackingData,
  togglePackingStatus,
  addExpenseData,
  deleteExpenseData,
  saveShoppingData,
  deleteShoppingData,
  toggleShoppingStatus,
} from '@/lib/gas-client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TripPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;
  const tripConfig: TripConfig | undefined = TRIPS[tripId];

  const [currentTab, setCurrentTab] = useState<TabType>('itinerary');
  const [hideVisited, setHideVisited] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Main data state
  const [tripData, setTripData] = useState<AllTripData>({
    itinerary: [],
    todo: [],
    packing: [],
    expenses: [],
    shopping: [],
    fxRate: 32.5,
    tripNote: '',
  });

  // Modal states
  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
  const [activeItineraryItem, setActiveItineraryItem] = useState<ItineraryItem | null>(null);

  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [activeTodoItem, setActiveTodoItem] = useState<TodoItem | null>(null);

  const [packingModalOpen, setPackingModalOpen] = useState(false);
  const [activePackingItem, setActivePackingItem] = useState<PackingItem | null>(null);

  const [shoppingModalOpen, setShoppingModalOpen] = useState(false);
  const [activeShoppingItem, setActiveShoppingItem] = useState<ShoppingItem | null>(null);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const targetApiUrl = tripConfig?.apiUrl || '';

  // Fetch data
  const fetchData = useCallback(async (bypassCache = false) => {
    if (!targetApiUrl) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getAllData(bypassCache, targetApiUrl);
      if (res) {
        setTripData({
          itinerary: res.itinerary || [],
          todo: res.todo || [],
          packing: res.packing || [],
          expenses: res.expenses || [],
          shopping: res.shopping || [],
          fxRate: res.fxRate || 32.5,
          tripNote: res.tripNote || '',
        });
      }
    } catch (err: any) {
      showToast(`資料載入失敗: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  }, [targetApiUrl]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  if (!tripConfig) {
    notFound();
  }

  // Itinerary Handlers
  const handleToggleVisited = async (rowIndex: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setTripData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((i) =>
        i.rowIndex === rowIndex ? { ...i, isVisited: nextStatus } : i
      ),
    }));

    try {
      await toggleVisitedStatus(rowIndex, nextStatus, targetApiUrl);
    } catch (err: any) {
      showToast(`更新失敗，正在還原: ${err.message}`);
      fetchData(false);
    }
  };

  const handleSaveItinerary = async (formData: any) => {
    try {
      showToast('正在儲存行程...');
      await saveItineraryData(formData, targetApiUrl);
      showToast('行程儲存成功！');
      fetchData(true);
    } catch (err: any) {
      showToast(`儲存失敗: ${err.message}`);
    }
  };

  const handleDeleteItinerary = async (rowIndex: number) => {
    try {
      showToast('正在刪除行程...');
      await deleteItineraryData(rowIndex, targetApiUrl);
      showToast('刪除成功！');
      fetchData(true);
    } catch (err: any) {
      showToast(`刪除失敗: ${err.message}`);
    }
  };

  // Todo Handlers
  const handleToggleTodo = async (rowIndex: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setTripData((prev) => ({
      ...prev,
      todo: prev.todo.map((t) =>
        t.rowIndex === rowIndex ? { ...t, isDone: nextStatus } : t
      ),
    }));

    try {
      await toggleTodoStatus(rowIndex, nextStatus, targetApiUrl);
    } catch (err: any) {
      showToast(`更新失敗，正在還原: ${err.message}`);
      fetchData(false);
    }
  };

  const handleSaveTodo = async (formData: any) => {
    try {
      showToast('正在儲存待辦...');
      await saveTodoData(formData, targetApiUrl);
      showToast('待辦儲存成功！');
      fetchData(true);
    } catch (err: any) {
      showToast(`儲存失敗: ${err.message}`);
    }
  };

  const handleDeleteTodo = async (rowIndex: number) => {
    try {
      showToast('正在刪除待辦...');
      await deleteTodoData(rowIndex, targetApiUrl);
      showToast('刪除成功！');
      fetchData(true);
    } catch (err: any) {
      showToast(`刪除失敗: ${err.message}`);
    }
  };

  // Packing Handlers
  const handleTogglePacking = async (rowIndex: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setTripData((prev) => ({
      ...prev,
      packing: prev.packing.map((p) =>
        p.rowIndex === rowIndex ? { ...p, isPacked: nextStatus } : p
      ),
    }));

    try {
      await togglePackingStatus(rowIndex, nextStatus, targetApiUrl);
    } catch (err: any) {
      showToast(`更新失敗，正在還原: ${err.message}`);
      fetchData(false);
    }
  };

  const handleSavePacking = async (formData: any) => {
    try {
      showToast('正在儲存打包項...');
      await savePackingData(formData, targetApiUrl);
      showToast('打包項儲存成功！');
      fetchData(true);
    } catch (err: any) {
      showToast(`儲存失敗: ${err.message}`);
    }
  };

  const handleDeletePacking = async (rowIndex: number) => {
    try {
      showToast('正在刪除打包項...');
      await deletePackingData(rowIndex, targetApiUrl);
      showToast('刪除成功！');
      fetchData(true);
    } catch (err: any) {
      showToast(`刪除失敗: ${err.message}`);
    }
  };

  // Expense Handlers
  const handleAddExpense = async (formData: any) => {
    try {
      showToast('正在新增記帳...');
      await addExpenseData(formData, targetApiUrl);
      showToast('記帳成功！');
      fetchData(true);
    } catch (err: any) {
      showToast(`記帳失敗: ${err.message}`);
    }
  };

  const handleDeleteExpense = async (rowIndex: number) => {
    try {
      showToast('正在刪除記帳...');
      await deleteExpenseData(rowIndex, targetApiUrl);
      showToast('刪除成功！');
      fetchData(true);
    } catch (err: any) {
      showToast(`刪除失敗: ${err.message}`);
    }
  };

  // Shopping Handlers
  const handleToggleShopping = async (rowIndex: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setTripData((prev) => ({
      ...prev,
      shopping: prev.shopping.map((s) =>
        s.rowIndex === rowIndex ? { ...s, isDone: nextStatus } : s
      ),
    }));

    try {
      await toggleShoppingStatus(rowIndex, nextStatus, targetApiUrl);
    } catch (err: any) {
      showToast(`更新失敗，正在還原: ${err.message}`);
      fetchData(false);
    }
  };

  const handleSaveShopping = async (formData: any) => {
    try {
      showToast('正在儲存購物項...');
      await saveShoppingData(formData, targetApiUrl);
      showToast('購物項儲存成功！');
      fetchData(true);
    } catch (err: any) {
      showToast(`儲存失敗: ${err.message}`);
    }
  };

  const handleDeleteShopping = async (rowIndex: number) => {
    try {
      showToast('正在刪除購物項...');
      await deleteShoppingData(rowIndex, targetApiUrl);
      showToast('刪除成功！');
      fetchData(true);
    } catch (err: any) {
      showToast(`刪除失敗: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        hideVisited={hideVisited}
        onToggleHideVisited={() => setHideVisited(!hideVisited)}
      />

      {/* Main Container */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Header */}
        <Header
          hideVisited={hideVisited}
          onToggleHideVisited={() => setHideVisited(!hideVisited)}
          onRefresh={() => fetchData(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          isLoading={isLoading}
        />

        {/* Top Back Link & Trip Title Bar */}
        <div className="bg-slate-100/80 border-b border-slate-200/60 px-4 py-2 flex items-center justify-between text-xs md:px-8">
          <Link
            href="/"
            className="flex items-center space-x-1 font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回旅程大廳</span>
          </Link>
          <span className="font-extrabold text-slate-700">{tripConfig.title}</span>
        </div>

        {/* Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 mt-4 md:px-8">
          {!targetApiUrl ? (
            <div className="bg-white border border-amber-200 rounded-3xl p-8 text-center space-y-3 max-w-md mx-auto my-12 shadow-sm">
              <div className="text-4xl">🏝️</div>
              <h3 className="text-lg font-extrabold text-slate-900">{tripConfig.title} (籌備中)</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                此旅程尚未設定 Google Sheet API 端點網址。您可以點擊右上角 ⚙️ 齒輪圖示填入 Web App 網址以啟用連線！
              </p>
              <button
                onClick={() => setSettingsModalOpen(true)}
                className="px-4 py-2 text-xs font-extrabold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer inline-block"
              >
                ⚙️ 設定 API 端點網址
              </button>
            </div>
          ) : isLoading && tripData.itinerary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-extrabold text-slate-400">正在讀取 Google Sheet 資料...</p>
            </div>
          ) : (
            <>
              {currentTab === 'itinerary' && (
                <ItineraryTab
                  data={tripData.itinerary}
                  tripNote={tripData.tripNote}
                  hideVisited={hideVisited}
                  onToggleVisited={handleToggleVisited}
                  onOpenModal={(item) => {
                    setActiveItineraryItem(item || null);
                    setItineraryModalOpen(true);
                  }}
                  onOpenLightbox={(img) => setLightboxUrl(img)}
                />
              )}

              {currentTab === 'todo' && (
                <TodoTab
                  data={tripData.todo}
                  hideDone={hideVisited}
                  onToggleTodo={handleToggleTodo}
                  onOpenModal={(item) => {
                    setActiveTodoItem(item || null);
                    setTodoModalOpen(true);
                  }}
                />
              )}

              {currentTab === 'packing' && (
                <PackingTab
                  data={tripData.packing}
                  hidePacked={hideVisited}
                  onTogglePacking={handleTogglePacking}
                  onOpenModal={(item) => {
                    setActivePackingItem(item || null);
                    setPackingModalOpen(true);
                  }}
                />
              )}

              {currentTab === 'expenses' && (
                <ExpensesTab
                  data={tripData.expenses}
                  fxRate={tripData.fxRate}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}

              {currentTab === 'shopping' && (
                <ShoppingTab
                  data={tripData.shopping}
                  hideDone={hideVisited}
                  onToggleShopping={handleToggleShopping}
                  onOpenModal={(item) => {
                    setActiveShoppingItem(item || null);
                    setShoppingModalOpen(true);
                  }}
                  onOpenLightbox={(img) => setLightboxUrl(img)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Modals */}
      <ItineraryModal
        isOpen={itineraryModalOpen}
        item={activeItineraryItem}
        onClose={() => setItineraryModalOpen(false)}
        onSave={handleSaveItinerary}
        onDelete={handleDeleteItinerary}
      />

      <TodoModal
        isOpen={todoModalOpen}
        item={activeTodoItem}
        onClose={() => setTodoModalOpen(false)}
        onSave={handleSaveTodo}
        onDelete={handleDeleteTodo}
      />

      <PackingModal
        isOpen={packingModalOpen}
        item={activePackingItem}
        onClose={() => setPackingModalOpen(false)}
        onSave={handleSavePacking}
        onDelete={handleDeletePacking}
      />

      <ShoppingModal
        isOpen={shoppingModalOpen}
        item={activeShoppingItem}
        onClose={() => setShoppingModalOpen(false)}
        onSave={handleSaveShopping}
        onDelete={handleDeleteShopping}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSaved={() => fetchData(true)}
      />

      <LightboxModal imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-extrabold flex items-center justify-between animate-scale-up">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
