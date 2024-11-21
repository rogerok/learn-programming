/**
 * Violating ISP
 */

interface PaymentProvider {
    validate: () => boolean;
    getPaymentCommission: () => number;
    processPayment: () => string;
    verifyPayment: () => boolean;
}

/**
 * The CreditCartPaymentProvider class does not provide an API to verify payment individually,
 * but since we’re implementing PaymentProvider, we are required to implement the verifyPayment method,
 * otherwise, the class implementation will throw an error.
 */

class CreditCardPaymentProvider implements PaymentProvider {
    validate() {
        console.log('validating card payment');
        return true
    }

    getPaymentCommission() {
        return 10
    }

    processPayment() {
        return 'Payment fingerprint';
    }

    verifyPayment() {
        // No verify Payment API exist
        // Return false to just implement the Payment Provider
        return false
    }
}

/**
 * Now suppose the wallet providers do not have a validate API, to implement PaymentProvider for WalletPaymentProvider.
 * In this case, we must create a validate method — which does nothing as can be seen below:
 *
 */

class WalletProvider implements PaymentProvider {
    validate() {
        // No validate method exists
        // Just for sake of implementation return false
        return false
    }

    getPaymentCommission() {
        return 5;
    }

    processPayment() {
        return 'Payment fingerprint';
    }

    verifyPayment() {
        // Payment verification does exist on Wallet Payment Provider
        console.log("Payment Verified");
        return false;
    }
}


/**
 * Solution
 */

interface PaymentProvider2 {
    getPaymentCommission: () => number;
    processPayment: () => string;
}

interface PaymentValidator {
    validate: () => boolean;
}

interface PaymentVerifier {
    verifyPayment: () => boolean;
}


class CreditCardPaymentProvider2 implements PaymentProvider2, PaymentValidator {
    validate() {
        console.log('validating card payment');
        return true
    }

    getPaymentCommission() {
        return 10
    }

    processPayment() {
        return 'Payment fingerprint';
    }
}

class WalletProvider2 implements PaymentProvider2 {
    getPaymentCommission() {
        return 5;
    }

    processPayment() {
        return 'Payment fingerprint';
    }
}