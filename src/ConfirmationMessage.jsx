import {useState} from 'react';

const ConfirmationMessage = ({ message, onConfirm, QuestionId, QuestionGroupId }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleConfirm = (choice) => {
        setIsVisible(false);
        onConfirm(choice, QuestionGroupId, QuestionId);
    };

    return (
        isVisible && (
            <div className="confirmationContainer ps-2 pe-2 pb-5">
                <div className="confirmationMessage">{message}</div>
                <div className="confirmationOptions">
                    <button className="yes p-2 ps-4 pe-4 me-4" onClick={() => handleConfirm(true)}>
                        Jā
                    </button>
                    <button className="no p-2 ps-4 pe-4 ms-4" onClick={() => handleConfirm(false)}>
                        Nē
                    </button>
                </div>
            </div>
        )
    );
};

export default ConfirmationMessage;