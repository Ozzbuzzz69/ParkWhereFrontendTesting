const baseUrl = "https://parkwhererest20251203132035-gdh2hyd0c9ded8ah.germanywestcentral-01.azurewebsites.net/api/parkwhere";

Vue.createApp({
    data() {
        return {
            parkingSpotAmountWest: null,
            latestUpdate: null,
            previousParkingAmount: null,
            timeoutId: null
        };
    },

    methods: {
        async getParkingSpotAmount() {
            try {
                const response = await axios.get(baseUrl);
                const newAmount = response.data;

                // Update parking spots
                this.parkingSpotAmountWest = newAmount;

                // Only update timestamp if value changed
                if (newAmount !== this.previousParkingAmount) {
                    this.latestUpdate = new Date().toLocaleTimeString('en-GB', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                    this.previousParkingAmount = newAmount;
                }
            } catch (ex) {
                console.error("Error fetching parking spots:", ex.message);
            } finally {
                // Keep polling every 2 seconds
                this.timeoutId = setTimeout(() => {
                    this.getParkingSpotAmount();
                }, 2000);
            }
        }
    },

    mounted() {
        this.getParkingSpotAmount(); // Start first fetch
    },

    beforeUnmount() {
        clearTimeout(this.timeoutId); // Cleanup
    }
}).mount("#app");
