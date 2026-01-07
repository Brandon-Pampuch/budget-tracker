class BudgetApp {
    constructor() {
        this.transactions = this.loadTransactions();
        this.init();
    }

    init() {
        this.form = document.getElementById('transaction-form');
        this.transactionList = document.getElementById('transaction-list');

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        this.updateUI();
        this.registerServiceWorker();
        this.setupNotifications();
    }

    loadTransactions() {
        const stored = localStorage.getItem('transactions');
        return stored ? JSON.parse(stored) : [];
    }

    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    handleSubmit(e) {
        e.preventDefault();

        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const type = document.querySelector('input[name="type"]:checked').value;

        const transaction = {
            id: Date.now(),
            description,
            amount,
            category,
            type,
            date: new Date().toISOString()
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.updateUI();
        this.form.reset();
        document.querySelector('input[name="type"][value="expense"]').checked = true;
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveTransactions();
        this.updateUI();
    }

    updateUI() {
        this.updateSummary();
        this.renderTransactions();
    }

    updateSummary() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expenses;

        document.getElementById('balance').textContent = this.formatCurrency(balance);
        document.getElementById('total-income').textContent = this.formatCurrency(income);
        document.getElementById('total-expenses').textContent = this.formatCurrency(expenses);
    }

    renderTransactions() {
        if (this.transactions.length === 0) {
            this.transactionList.innerHTML = '<div class="empty-state">No transactions yet</div>';
            return;
        }

        this.transactionList.innerHTML = this.transactions.map(transaction => `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-info">
                    <div class="transaction-description">${this.escapeHtml(transaction.description)}</div>
                    <div class="transaction-category">${this.escapeHtml(transaction.category)}</div>
                </div>
                <div class="transaction-actions">
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </div>
                    <button class="btn-delete" onclick="app.deleteTransaction(${transaction.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(Math.abs(amount));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered');
                    this.swRegistration = registration;
                })
                .catch(error => console.log('Service Worker registration failed:', error));
        }
    }

    async setupNotifications() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            this.scheduleNotifications();
            this.updateNotificationStatus(true);
        } else {
            this.updateNotificationStatus(false);
        }
    }

    scheduleNotifications() {
        this.scheduleNextNotification(14, 0);
        this.scheduleNextNotification(21, 0);
    }

    scheduleNextNotification(hour, minute) {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hour, minute, 0, 0);

        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const timeUntilNotification = scheduledTime - now;

        setTimeout(() => {
            this.showNotification();
            setInterval(() => this.showNotification(), 24 * 60 * 60 * 1000);
        }, timeUntilNotification);
    }

    showNotification() {
        if ('serviceWorker' in navigator && this.swRegistration) {
            this.swRegistration.showNotification('Budget Reminder', {
                body: 'Time to log your transactions and check your bank account!',
                icon: 'icon-192.png',
                badge: 'icon-192.png',
                vibrate: [200, 100, 200],
                tag: 'budget-reminder',
                requireInteraction: true,
                actions: [
                    { action: 'open', title: 'Open App' },
                    { action: 'dismiss', title: 'Dismiss' }
                ]
            });
        }
    }

    updateNotificationStatus(enabled) {
        const statusElement = document.getElementById('notification-status');
        if (statusElement) {
            statusElement.textContent = enabled
                ? 'Notifications enabled (2pm & 9pm daily)'
                : 'Notifications disabled';
            statusElement.className = enabled ? 'notification-enabled' : 'notification-disabled';
        }
    }
}

const app = new BudgetApp();
