const baseUrl = "http://localhost:5166/api/parkwhere";

// 1. CHART COMPONENT
const ParkingChart = {
    props: ['chartData', 'chartLabels', 'chartTitle'],
    template: `
        <div style="position: relative; height: 100%; width: 100%;">
            <canvas ref="chartCanvas"></canvas>
        </div>
    `,
    data() { return { chartInstance: null }; },
    watch: {
        chartData: {
            handler() { this.renderChart(); },
            deep: true
        }
    },
    mounted() { this.renderChart(); },
    methods: {
        renderChart() {
            if (this.chartInstance) this.chartInstance.destroy();

            const ctx = this.$refs.chartCanvas.getContext('2d');
            this.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: this.chartLabels,
                    datasets: [{
                        label: this.chartTitle,
                        data: this.chartData,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    plugins: { legend: { display: true } }
                }
            });
        }
    }
};

// 2. APP LOGIC
Vue.createApp({
    components: {
        'parking-chart': ParkingChart
    },
    data() {
        return {
            // Live Counter Data
            parkingSpotAmountWest: null,
            latestUpdate: null,
            previousParkingAmount: null,
            timeoutId: null,

            // Chart Data
            viewMode: 'hourly',
            currentChartData: [],
            currentLabels: [],
            currentTitle: 'Vehicles Entered (By Hour)',
        };
    },
    methods: {
        // Live Counter
        async getParkingSpotAmount() {
            try {
                const response = await axios.get(baseUrl);
                const newAmount = Number(response.data);
                this.parkingSpotAmountWest = newAmount;

                if (newAmount !== this.previousParkingAmount) {
                    this.latestUpdate = new Date().toLocaleTimeString('en-GB', {
                        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
                    });
                    this.previousParkingAmount = newAmount;
                }
            } catch (ex) {
                console.error("Counter Error:", ex.message);
            } finally {
                this.timeoutId = setTimeout(() => this.getParkingSpotAmount(), 2000);
            }
        },

        // Chart Data
        async loadHourlyData() {
            try {
                const response = await axios.get(baseUrl + "/GetAmountStartParkingEachHour");
                this.currentChartData = response.data;
                this.currentLabels = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0') + ":00");
                this.currentTitle = "Vehicles Entered (By Hour)";
                this.viewMode = 'hourly';
            } catch (error) { console.error(error); }
        },

        async loadDailyData() {
            try {
                const response = await axios.get(baseUrl + "/GetAmountStartParkingEachDay");
                this.currentChartData = response.data;
                this.currentLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                this.currentTitle = "Vehicles Entered (By Day)";
                this.viewMode = 'daily';
            } catch (error) { console.error(error); }
        },

        switchView(mode) {
            if (mode === 'hourly') this.loadHourlyData();
            else this.loadDailyData();
        }
    },
    mounted() {
        this.getParkingSpotAmount();
        this.loadHourlyData(); 
    },
    beforeUnmount() {
        clearTimeout(this.timeoutId);
    }
}).mount("#app");