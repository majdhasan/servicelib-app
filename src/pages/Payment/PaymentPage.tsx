import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonSpinner,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import Confetti from "react-confetti";
import "./PaymentPage.css"; // Add styles for the page if necessary

const PaymentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(true);
    const [isPaid, setIsPaid] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Fetch booking to ensure it exists
        const fetchBooking = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/bookings/${id}`);
                if (!response.ok) {
                    throw new Error("Booking not found.");
                }
                const booking = await response.json();
                setIsPaid(booking.isPaid);
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/bookings/${id}/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Payment failed.");
            }

            // Wait for confirmation of payment
            const updatedBooking = await response.json();
            setShowConfetti(true); // Trigger confetti animation
            setTimeout(() => {
                history.push(`/confirmation/${id}?refresh=true`);
            }, 3000);
        } catch (error) {
            console.error("Payment error:", error);
            setError((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Processing...</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonSpinner />
                </IonContent>
            </IonPage>
        );
    }

    if (error) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Error</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <p>{error}</p>
                    <IonButton expand="block" onClick={() => history.push("/")}>
                        Go Back
                    </IonButton>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            {showConfetti && <Confetti />}
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Payment</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {isPaid ? (
                    <div>
                        <h2>Booking Already Paid</h2>
                        <IonButton expand="block" onClick={() => history.push(`/confirmation/${id}?refresh=true`)}>
                            View Confirmation
                        </IonButton>
                    </div>
                ) : (
                    <div>
                        <h2>Ready to Pay for Booking #{id}?</h2>
                        <IonButton expand="block" color="success" onClick={handlePayment}>
                            Pay Now
                        </IonButton>
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default PaymentPage;
