const subscriptionGuard = async (req, res, next) => {
    // Codester standalone distribution: No paywall or subscription expiry blocking
    return next();
};

module.exports = subscriptionGuard;
