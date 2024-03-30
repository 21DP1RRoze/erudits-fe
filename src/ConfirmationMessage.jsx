import {useState} from 'react';

const ConfirmationMessage = ({ message, onConfirm, QuestionId, QuestionGroupId }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleConfirm = (choice) => {
        setIsVisible(false);
        onConfirm(choice, QuestionGroupId, QuestionId);
    };

    return (
        isVisible && (
            <div className="confirmationContainer p-5">
                <div className="confirmationMessage pb-4">{message}</div>
                <div className="confirmationOptions">
                    <button className="btn-action p-2 ps-4 pe-4 me-4" onClick={() => handleConfirm(true)}>
                        Jā
                    </button>
                    <button className="btn-action p-2 ps-4 pe-4 ms-4" onClick={() => handleConfirm(false)}>
                        Nē
                    </button>
                </div>
            </div>
        )
    );
};

export default ConfirmationMessage;