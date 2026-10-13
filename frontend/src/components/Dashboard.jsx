/**
 * Main Dashboard Component - ULTIMATE EDITION with all features
 * Quantum Telecom Simulator
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Key, 
  MessageSquare, 
  Activity, 
  AlertTriangle,
  Network,
  RefreshCw,
  Play,
  StopCircle,
  Zap,
  Sparkles,
  Clock,
  Download,
  Keyboard,
  User,
  Eye,
  BarChart3,
  RotateCw,
  Camera,
  Palette,
  Users,
  Brain,
  Radar,
  Globe,
  Move,
  Link
} from 'lucide-react';
import { api } from '../utils/api';
import useWebSocket from '../hooks/useWebSocket';
import Network3D from './Network3D';
import QKDStatus from './QKDStatus';
import ChatBox from './ChatBox';
import AttackAlerts from './AttackAlerts';
import KPIAnalytics from './KPIAnalytics';
import ThemeToggle from './ThemeToggle';
import QuantumBackground from './QuantumBackground';
import AttackTypeSelector from './AttackTypeSelector';
import BB84Visualizer from './BB84Visualizer';
import ExportReport from './ExportReport';
import KeyboardShortcuts from './KeyboardShortcuts';
import LoginSimulation from './LoginSimulation';
import NetworkLatencyMonitor from './NetworkLatencyMonitor';
import KeyRotationCounter from './KeyRotationCounter';
import MessageSearch from './MessageSearch';
import ToastNotifications from './ToastNotifications';
import { useSound } from './SoundManager';
import ScreenshotButton from './ScreenshotButton';
import ThemeCustomizer from './ThemeCustomizer';
import SecurityLevel from './SecurityLevel';
import KeyExpiryWarning from './KeyExpiryWarning';
import MultiUser from './MultiUser';
import GroupChat from './GroupChat';
import Globe3D from './Globe3D';
import AIPrediction from './AIPrediction';
import AnomalyDetection from './AnomalyDetection';
import LiveTraffic from './LiveTraffic';
import MultiNodeNetwork from './MultiNodeNetwork';
import QuantumWaveFunction from './QuantumWaveFunction';
import InteractiveTopology from './InteractiveTopology';

const Dashboard = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showBB84, setShowBB84] = useState(false);
  const [messages, setMessages] = useState([]);
  const [attacks, setAttacks] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const dashboardRef = useRef(null);
  
  const { isConnected, lastMessage, sendAction } = useWebSocket();
  const { playKeyGenerated, playMessageSent, playAttackDetected, playKeyCompromised } = useSound();

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show toast notification
  const showToast = (message, type = 'info', duration = 5000) => {
    const newToast = { id: Date.now(), message, type, duration };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, duration);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [status, kpi, msgHistory, attackLogs] = await Promise.all([
        api.network.simulator.status(),
        api.kpi.analysis(),
        api.message.history(50),
        api.attack.logs(50)
      ]);
      setNetworkStatus(status);
      setKpiData(kpi);
      setMessageCount(kpi?.total_secure_messages || 0);
      
      if (msgHistory?.messages) {
        setMessages(msgHistory.messages);
        setFilteredMessages(msgHistory.messages);
      }
      if (attackLogs?.attacks) {
        setAttacks(attackLogs.attacks);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to fetch network data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchData();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'network_status') {
        setNetworkStatus(lastMessage.data);
        if (lastMessage.data?.kpi) {
          setKpiData(lastMessage.data.kpi);
        }
      } else if (lastMessage.type === 'qkd_status') {
        fetchData();
      } else if (lastMessage.type === 'attack') {
        playAttackDetected();
        showToast('⚠️ Attack Detected!', 'error', 6000);
      }
    }
  }, [lastMessage]);

  const forceRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    sendAction('get_status');
    sendAction('get_qkd_status');
  };

  const handleLogin = (role) => {
    if (role) {
      setIsLoggedIn(true);
      setCurrentUser(role);
      showToast(`✅ Logged in as ${role.charAt(0).toUpperCase() + role.slice(1)}`, 'success');
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
      showToast('👋 Logged out', 'info');
    }
  };

  const handleAttack = async (attackType) => {
    try {
      const result = await api.network.simulate.attack(attackType);
      console.log('Attack result:', result);
      await fetchData();
      sendAction('attack_alert', { attack_type: attackType });
      playAttackDetected();
      showToast(`⚔️ ${attackType} attack detected and blocked!`, 'error', 6000);
    } catch (err) {
      console.error('Attack failed:', err);
      showToast('❌ Attack simulation failed', 'error');
    }
  };

  const handleShortcut = (action) => {
    switch (action) {
      case 'send':
        document.querySelector('input[type="text"]')?.focus();
        break;
      case 'key':
        document.querySelector('button:has(.Shield)')?.click();
        break;
      case 'attack':
        document.querySelector('button:has(.Zap)')?.click();
        break;
      case 'reset':
        resetSimulation();
        break;
      case 'demo':
        runDemo();
        break;
      default:
        break;
    }
  };

  const runDemo = async () => {
    try {
      setIsSimulating(true);
      setError(null);
      setShowBB84(true);
      
      showToast('🚀 Running demo...', 'info', 3000);
      
      await api.network.simulator.demo();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchData();
      sendAction('get_status');
      sendAction('get_qkd_status');
      
      setTimeout(() => setShowBB84(false), 3000);
      showToast('✅ Demo completed!', 'success', 4000);
    } catch (err) {
      console.error('Demo failed:', err);
      setError('Demo simulation failed: ' + err.message);
      showToast('❌ Demo failed', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const resetSimulation = async () => {
    try {
      await api.network.simulator.reset();
      await fetchData();
      setRefreshTrigger(prev => prev + 1);
      sendAction('get_status');
      sendAction('get_qkd_status');
      setNetworkStatus(null);
      setKpiData(null);
      setMessages([]);
      setFilteredMessages([]);
      setAttacks([]);
      setMessageCount(0);
      setTimeout(fetchData, 300);
      showToast('✅ Simulation reset successfully', 'success');
    } catch (err) {
      console.error('Reset failed:', err);
      setError('Reset failed');
      showToast('❌ Reset failed', 'error');
    }
  };

  const handleDataChanged = () => {
    fetchData();
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFilteredMessages = (filtered) => {
    setFilteredMessages(filtered);
  };

  const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  if (loading && !networkStatus) {
    return (
      <div className="flex items-center justify-center h-screen">
        <QuantumBackground />
        <div className="text-center z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500/20"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading Quantum Network...</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">⚛️ Initializing quantum channels</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg transition-colors duration-300">
      <QuantumBackground />
      
      {/* Toast Notifications */}
      <ToastNotifications messages={toasts} />

      <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <Shield className="w-9 h-9 text-blue-500 relative" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                🔐 Quantum Telecom Simulator
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                BSNL Internship Project • Quantum Secure Communication
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Login */}
            <LoginSimulation 
              onLogin={handleLogin} 
              isLoggedIn={isLoggedIn} 
              currentUser={currentUser} 
            />
            
            {/* Multi-User */}
            <MultiUser 
              onUserSelect={(user) => showToast(`👤 Switched to ${user}`, 'info')}
              currentUser={currentUser}
            />
            
            {/* Uptime */}
            <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-dark-bg text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              {formatUptime(uptime)}
            </div>
            
            {/* Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              isConnected ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            
            {/* Screenshot Button */}
            <ScreenshotButton targetRef={dashboardRef} />
            
            {/* Export Report */}
            <ExportReport 
              kpiData={kpiData} 
              messages={messages} 
              attacks={attacks} 
            />
            
            {/* Theme Customizer */}
            <ThemeCustomizer />
            
            <ThemeToggle />
            
            <button
              onClick={runDemo}
              disabled={isSimulating}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 text-sm font-medium shadow-lg shadow-blue-500/25"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Demo
                </>
              )}
            </button>
            
            <button
              onClick={resetSimulation}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gray-200 dark:bg-dark-bg text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition text-sm font-medium"
            >
              <StopCircle className="w-4 h-4" />
              Reset
            </button>
            
            <button
              onClick={forceRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg transition"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* BB84 Visualizer */}
        {showBB84 && (
          <div className="mb-6 animate-slide-up">
            <BB84Visualizer 
              isActive={showBB84} 
              onComplete={() => setShowBB84(false)} 
            />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 backdrop-blur-sm animate-slide-up">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3D Network Globe */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  3D Quantum Network
                </h2>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    networkStatus?.quantum_channel?.status === 'secure' ? 'bg-green-500 animate-pulse' :
                    networkStatus?.quantum_channel?.status === 'compromised' ? 'bg-red-500 animate-pulse' :
                    'bg-gray-400'
                  }`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {networkStatus?.quantum_channel?.status === 'secure' ? '🟢 Secure' :
                     networkStatus?.quantum_channel?.status === 'compromised' ? '🔴 Compromised' :
                     '⚪ Idle'}
                  </span>
                </div>
              </div>
              <Globe3D status={networkStatus} />
            </div>

            {/* Live Traffic Flow */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Live Network Traffic
                </h3>
                <span className="text-[10px] text-gray-400">
                  {networkStatus?.quantum_channel?.status === 'secure' ? '🟢 Secure' : '⚪ Monitoring'}
                </span>
              </div>
              <LiveTraffic status={networkStatus} />
            </div>

            {/* Multi-Node Network */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <MultiNodeNetwork status={networkStatus} />
            </div>

            {/* Quantum Wave Function */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Quantum Wave Function
                </h3>
                <span className="text-[10px] text-gray-400">
                  {networkStatus?.quantum_channel?.compromised ? '🔴 Collapsed' : '⚛️ Superposition'}
                </span>
              </div>
              <QuantumWaveFunction status={networkStatus} />
            </div>

            {/* Interactive Topology */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <InteractiveTopology status={networkStatus} />
            </div>

            {/* Security Level */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <SecurityLevel 
                keyLength={kpiData?.quantum_key_strength || 0}
                isCompromised={networkStatus?.quantum_channel?.compromised || false}
                attackCount={kpiData?.total_attacks_detected || 0}
                errorRate={kpiData?.error_rate || 0}
              />
            </div>

            {/* QKD Status + Attack Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QKDStatus status={networkStatus} onKeyGenerated={handleDataChanged} />
              <AttackAlerts status={networkStatus} />
            </div>

            {/* Attack Type Selector */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Attack Simulator</h3>
              </div>
              <AttackTypeSelector 
                onAttackSelect={handleAttack} 
                isDisabled={!networkStatus?.nodes?.alice?.has_key} 
              />
            </div>

            {/* Anomaly Detection */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Radar className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Anomaly Detection</h3>
              </div>
              <AnomalyDetection networkStatus={networkStatus} messages={messages} />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Secure Chat */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  Secure Chat
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  {kpiData?.message_encryption_rate || 0}% encrypted
                </div>
              </div>
              
              <div className="mb-2">
                <MessageSearch 
                  messages={messages} 
                  onFiltered={handleFilteredMessages} 
                />
              </div>
              
              <ChatBox onMessageSent={handleDataChanged} />
            </div>

            {/* Key Expiry Warning */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <KeyExpiryWarning 
                keyLength={kpiData?.quantum_key_strength || 0}
                messagesSent={messageCount}
                maxMessages={10}
                onRotate={() => {
                  document.querySelector('button:has(.Shield)')?.click();
                  showToast('🔄 Key rotated successfully!', 'success');
                }}
              />
            </div>

            {/* KPI Analytics */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  KPI Analytics
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  kpiData?.security_score >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  kpiData?.security_score >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  Score: {kpiData?.security_score || 0}%
                </span>
              </div>
              <KPIAnalytics data={kpiData} />
            </div>

            {/* Network Latency */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Network Latency</h3>
              </div>
              <NetworkLatencyMonitor />
            </div>

            {/* Key Rotation Counter */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <KeyRotationCounter 
                messagesSent={messageCount} 
                maxMessages={10} 
                onRotate={() => {
                  document.querySelector('button:has(.Shield)')?.click();
                  showToast('🔄 Key rotated successfully!', 'success');
                }}
              />
            </div>

            {/* AI Attack Prediction */}
            <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-purple-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Attack Prediction</h3>
              </div>
              <AIPrediction attackHistory={attacks} networkStatus={networkStatus} />
            </div>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Security Score</span>
              <Shield className={`w-4 h-4 ${
                (kpiData?.security_score || 0) >= 80 ? 'text-green-500' :
                (kpiData?.security_score || 0) >= 50 ? 'text-yellow-500' : 'text-red-500'
              }`} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {kpiData?.security_score || 0}%
            </p>
          </div>
          
          <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Key Strength</span>
              <Key className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {kpiData?.quantum_key_strength || 0} bits
            </p>
          </div>
          
          <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Messages Sent</span>
              <MessageSquare className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {kpiData?.total_secure_messages || 0}
            </p>
          </div>
          
          <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-dark-border/20 p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Attacks Blocked</span>
              <AlertTriangle className={`w-4 h-4 ${(kpiData?.total_attacks_detected || 0) > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
              {kpiData?.total_attacks_detected || 0}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-dark-border pt-4 flex flex-wrap items-center justify-between gap-2">
          <span>⚛️ Quantum Telecom Simulator v3.0 • BSNL Internship Project</span>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <RotateCw className="w-3 h-3" />
              Key Rotation: {10 - (messageCount % 11)} msgs left
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {isLoggedIn ? currentUser : 'Guest'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {networkStatus?.nodes ? Object.keys(networkStatus.nodes).length : 0} nodes
            </span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts onShortcut={handleShortcut} />
    </div>
  );
};

export default Dashboard;