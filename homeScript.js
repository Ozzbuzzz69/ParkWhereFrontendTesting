const baseUrl = "http://localhost:5166/api/parkwhere";

Vue.createApp({
    data() {
        return {
            parkingSpotAmountWest: null,
            latestUpdate: null,
            previousParkingAmount: null,
            timeoutId: null,
            alerted: false
        };
    },

    methods: {
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

                if (this.parkingSpotAmountWest < 10 && !this.alerted) {
                    alert(`Low spots! Only ${this.parkingSpotAmountWest} spots left.`);
                    this.alerted = true;
                } else if (this.parkingSpotAmountWest >= 10) {
                    this.alerted = false;
                }
            } catch (ex) {
                console.error("Error fetching parking spots:", ex.message);
            } finally {
                this.timeoutId = setTimeout(() => this.getParkingSpotAmount(), 2000);
            }
        }
    },

    mounted() {
        this.getParkingSpotAmount();
    },

    beforeUnmount() {
        clearTimeout(this.timeoutId);
    },

    computed: {
        getParkingColor() {
            if (this.parkingSpotAmountWest === 0) return '#b52c2c'; // red
            else if (this.parkingSpotAmountWest < 75) return '#c97108'; // orange
            else return '#3ebb3eff'; // green
        }
    }
}).mount("#app");