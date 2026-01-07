// pages/index.js - Telegram Mini App
// Deploy ini ke Vercel

import {useState, useEffect} from 'react';
import Head from 'next/head';

export default function Home() {
  const [formData, setFormData] = useState({
    templateType: 'payment',
    merchantName: 'DEFT BARBER',
    receiverId: '0857•••5875',
    amount: '40000',
    date: '01 Jan 2026',
    time: '15:55',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    // Get user_id from URL parameter
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('user_id');
    setUserId(uid);

    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Set theme
      document.body.style.backgroundColor = tg.themeParams.bg_color || '#ffffff';

      // Get user from Telegram WebApp
      if (tg.initDataUnsafe?.user) {
        setUserId(tg.initDataUnsafe.user.id);
      }
    }

    // Set default date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'});
    const timeStr = now.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit', hour12: false});

    setFormData(prev => ({
      ...prev,
      date: dateStr,
      time: timeStr,
    }));
  }, []);

  const handleChange = e => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!userId) {
      setMessage('❌ User ID tidak ditemukan!');
      return;
    }

    if (!formData.merchantName || !formData.amount) {
      setMessage('❌ Mohon isi semua field!');
      return;
    }

    setLoading(true);
    setMessage('⏳ Generating receipt...');

    try {
      const response = await fetch('https://your-php-server.com/generate.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          chat_id: userId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('✅ Receipt berhasil dikirim ke Telegram!');
        setQuota(result.quota);

        // Close WebApp after 2 seconds
        setTimeout(() => {
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.close();
          }
        }, 2000);
      } else {
        setMessage('❌ ' + (result.error || 'Terjadi kesalahan'));
        if (result.quota !== undefined) {
          setQuota(result.quota);
        }
      }
    } catch (error) {
      setMessage('❌ Koneksi gagal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Receipt Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </Head>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎨 Generate Receipt</h1>
          {quota !== null && (
            <p style={styles.quota}>
              Sisa kuota: <strong>{quota}</strong>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tipe Template</label>
            <select name="templateType" value={formData.templateType} onChange={handleChange} style={styles.select}>
              <option value="payment">Pembayaran (Bayar)</option>
              <option value="receive">Penerimaan (Terima)</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nama Penerima/Pengirim</label>
            <input type="text" name="merchantName" value={formData.merchantName} onChange={handleChange} style={styles.input} placeholder="Contoh: DEFT BARBER" required />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nomor Penerima</label>
            <input type="text" name="receiverId" value={formData.receiverId} onChange={handleChange} style={styles.input} placeholder="Contoh: 0857•••5875" />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nominal (Rp)</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} style={styles.input} placeholder="40000" required />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tanggal</label>
              <input type="text" name="date" value={formData.date} onChange={handleChange} style={styles.input} placeholder="01 Jan 2026" />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Waktu</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} style={styles.input} />
            </div>
          </div>

          {message && (
            <div
              style={{
                ...styles.message,
                backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
                color: message.includes('✅') ? '#065f46' : '#991b1b',
              }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
            {loading ? '⏳ Generating...' : '🚀 Generate Receipt'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Powered by Receipt Generator Bot</p>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '10px',
  },
  quota: {
    fontSize: '14px',
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '20px',
    flex: 1,
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  message: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#1A8FE8',
    border: 'none',
    borderRadius: '8px',
    transition: 'transform 0.2s',
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '12px',
    color: '#999',
  },
};
