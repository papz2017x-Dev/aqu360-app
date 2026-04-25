const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// 1. Notify User when their order status changes
exports.onOrderStatusChange = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const prevData = change.before.data();

        // Only notify if status actually changed
        if (newData.status !== prevData.status) {
            console.log(`Status change detected for order ${context.params.orderId}: ${prevData.status} -> ${newData.status}`);
            
            const userDoc = await admin.firestore().collection('users').doc(newData.userId).get();
            const fcmToken = userDoc.exists ? userDoc.data().fcmToken : null;

            if (fcmToken) {
                const message = {
                    notification: {
                        title: 'Order Status Updated 🚀',
                        body: `Your order #${context.params.orderId.substring(0,5)} is now ${newData.status.toUpperCase().replace('-', ' ')}`,
                    },
                    android: {
                        notification: {
                            sound: 'default',
                            clickAction: 'FLUTTER_NOTIFICATION_CLICK', // Common for cross-platform apps
                        }
                    },
                    token: fcmToken,
                };
                
                try {
                    await admin.messaging().send(message);
                    console.log('Successfully sent status update notification');
                } catch (error) {
                    console.error('Error sending status update notification:', error);
                }
            } else {
                console.log('User has no FCM token saved, skipping notification');
            }
        }
        return null;
    });

// 2. Notify Admin when a new order is placed
exports.onNewOrder = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
        const order = snap.data();
        console.log(`New order detected: ${context.params.orderId}`);
        
        // Get all admins and superusers
        const adminsSnap = await admin.firestore().collection('users')
            .where('role', 'in', ['admin', 'superuser']).get();
            
        const tokens = adminsSnap.docs
            .map(doc => doc.data().fcmToken)
            .filter(token => token); // Only those with registered tokens

        if (tokens.length > 0) {
            const message = {
                notification: {
                    title: 'New Order Received! 🔔',
                    body: `New order from ${order.customerName} for ₱${order.totalAmount}`,
                },
                android: {
                    notification: {
                        sound: 'default',
                    }
                },
                tokens: tokens,
            };
            
            try {
                await admin.messaging().sendEachForMulticast(message);
                console.log(`Successfully sent new order notifications to ${tokens.length} admins`);
            } catch (error) {
                console.error('Error sending new order notifications:', error);
            }
        } else {
            console.log('No admins found with registered FCM tokens');
        }
        return null;
    });
