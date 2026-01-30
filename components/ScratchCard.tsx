import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Timestamp } from 'firebase/firestore';

const { width } = Dimensions.get('window');

interface ScratchCardProps {
    counter: string;
    isUsed: boolean;
    isExpired: boolean;
    revealedAt: Timestamp | null;
    items: { name: string; qty: number }[];
    onReveal: () => void;
}

export const ScratchCard = ({ counter, isUsed, isExpired, revealedAt, items, onReveal }: ScratchCardProps) => {
    const [revealed, setRevealed] = useState(!!revealedAt);
    const [scratchProgress, setScratchProgress] = useState(0);
    const progressRef = useRef(0); // Use ref to avoid stale closure in PanResponder

    const [phase, setPhase] = useState<'visible' | 'faded' | 'hidden'>(() => {
        if (!revealedAt) return 'visible';
        const revealedTime = (revealedAt as any).toMillis ? (revealedAt as any).toMillis() : (revealedAt as any);
        if (isNaN(revealedTime)) return 'visible';
        const age = Date.now() - revealedTime;
        if (age > 5 * 60 * 1000) return 'hidden'; // Hide after 5m
        if (age > 1.5 * 60 * 1000) return 'faded'; // Fade after 1m 30s
        return 'visible';
    });

    const opacity = useRef(new Animated.Value(!!revealedAt ? 0 : 1)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const shake = useRef(new Animated.Value(0)).current;

    // Timer to update the phase based on revealedAt
    useEffect(() => {
        if (!revealedAt) return;

        const updatePhase = () => {
            const revealedTime = (revealedAt as any).toMillis ? (revealedAt as any).toMillis() : (revealedAt as any);
            if (isNaN(revealedTime)) return;

            const age = Date.now() - revealedTime;

            if (age > 5 * 60 * 1000) {
                setPhase('hidden');
            } else if (age > 1.5 * 60 * 1000) {
                setPhase('faded');
            } else {
                setPhase('visible');
            }
        };

        updatePhase();
        const interval = setInterval(updatePhase, 5000);
        return () => clearInterval(interval);
    }, [revealedAt]);

    const handleScratch = (gestureState: any) => {
        if (revealed || isUsed || isExpired) return;

        const velocity = Math.sqrt(gestureState.vx ** 2 + gestureState.vy ** 2);

        // Use instantaneous movement magnitude if possible, but PanResponder gives accumulated dx/dy.
        // Better approach: just accumulate a small amount per move event or use distance.
        // Issue with distance: it resets on new gesture.
        // We want to add to existing progress.

        // Simplified Logic: Just add a small amount for every move event based on velocity
        // But onPanResponderMove fires a lot. 

        // Let's rely on the fact that we're using a ref now, so we can accumulate properly.
        // We'll approximate "amount scratched" by velocity.

        const scratchFactor = 0.005 + (velocity * 0.005);
        const newProgress = Math.min(progressRef.current + scratchFactor, 1);

        progressRef.current = newProgress;
        setScratchProgress(newProgress);
        opacity.setValue(1 - newProgress);

        if (newProgress >= 0.4) {
            triggerReveal();
        }
    };

    const triggerReveal = () => {
        if (revealed) return;
        setRevealed(true);
        Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.sequence([
                Animated.timing(scale, { toValue: 1.08, duration: 200, useNativeDriver: true }),
                Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true })
            ])
        ]).start(() => {
            onReveal();
        });
    };

    // Recreate PanResponder if needed or just use ref. 
    // Since we use progressRef inside handleScratch, the closure staleness is avoided for the value.
    // However, handleScratch itself is inside the component. 
    // The PanResponder callback calls the *latest* handleScratch if we update it, 
    // OR we can make PanResponder use a ref to the handler.

    // Easier fix: Use useRef for the PanResponder and don't recreate it, 
    // but ensure handleScratch uses refs for all mutable state it needs.
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => handleScratch(gestureState),
        })
    ).current;

    const contentOpacity = phase === 'faded' ? 0.3 : (phase === 'hidden' ? 0 : 1);

    return (
        <View style={styles.cardContainer as any}>
            <Text style={styles.counterTitle as any}>{counter}</Text>
            <View style={[styles.scratchArea as any, phase === 'hidden' && { backgroundColor: '#fff' }]}>

                {/* The Hidden Content */}
                <View style={[styles.contentContainer as any, { opacity: contentOpacity }]}>
                    <View style={styles.tokenBox as any}>
                        <Text style={styles.tokenLabel as any}>ORDER ITEMS</Text>
                        <View style={styles.itemsList as any}>
                            {items.map((item, idx) => (
                                <View key={idx} style={styles.itemRow as any}>
                                    <Text style={styles.itemName as any}>{item.name}</Text>
                                    <Text style={styles.itemQty as any}>x{item.qty}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Status Overlay */}
                {(phase !== 'visible' || (isExpired && !revealedAt)) && (
                    <View style={styles.badgeOverlay as any}>
                        {isExpired && !revealedAt ? (
                            <View style={[styles.badge as any, styles.expiredBadge as any]}>
                                <Ionicons name="time" size={16} color="#fff" />
                                <Text style={styles.badgeText as any}>EXPIRED (8h PASS)</Text>
                            </View>
                        ) : (
                            <View style={[styles.badge as any, styles.usedBadge as any]}>
                                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                <Text style={styles.badgeText as any}>USED / COLLECTED</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* The Scratch Overlay */}
                {!revealed && (
                    <Animated.View
                        {...panResponder.panHandlers}
                        style={[
                            styles.overlay as any,
                            {
                                opacity,
                                transform: [
                                    { scale },
                                    { translateX: shake.interpolate({ inputRange: [0, 1], outputRange: [0, 2] }) }
                                ]
                            }
                        ]}
                    >
                        <View style={styles.gradientSim as any}>
                            <Ionicons name="gift" size={50} color="#fff" />
                            <Text style={styles.overlayText as any}>Visible only for 1 min after scratch!</Text>

                            {/* Fluid progress indicator */}
                            <View style={styles.hintContainer as any}>
                                <View style={[styles.hintBar as any, { width: `${scratchProgress * 100}%` }]} />
                            </View>
                        </View>
                    </Animated.View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 24,
        padding: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    counterTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 15,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scratchArea: {
        minHeight: 220,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#f1f5f9',
    },
    contentContainer: {
        width: '100%',
        padding: 20,
        alignItems: 'center',
    },
    tokenBox: {
        width: '100%',
        alignItems: 'center',
    },
    tokenLabel: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '700',
        alignSelf: 'flex-start',
        marginBottom: 10,
        letterSpacing: 1,
    },
    itemsList: {
        width: '100%',
        gap: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 10,
    },
    itemName: {
        fontSize: 16,
        color: '#334155',
        fontWeight: '700',
        flex: 1,
    },
    itemQty: {
        fontSize: 16,
        color: '#f97316',
        fontWeight: '800',
        marginLeft: 15,
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        zIndex: 15,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        gap: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    usedBadge: {
        backgroundColor: '#334155',
    },
    expiredBadge: {
        backgroundColor: '#ef4444',
    },
    badgeText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#475569',
        zIndex: 20,
    },
    gradientSim: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    overlayText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 15,
        letterSpacing: 0.5,
    },
    hintContainer: {
        marginTop: 30,
        width: '70%',
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    hintBar: {
        height: '100%',
        backgroundColor: '#f97316',
    }
});
