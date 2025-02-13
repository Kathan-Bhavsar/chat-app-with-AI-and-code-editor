import { Toaster } from 'react-hot-toast';

const GlobalToaster = () => {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                duration: 2000,
                style: {
                    background: '#1e1e1e', // Darker background for better contrast
                    color: '#f5f5f5', // Slightly off-white for readability
                    borderRadius: '8px', // Rounded corners for a modern look
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)', // Soft shadow for depth
                },
                success: {
                    style: {
                        background: '#4338CA', // Darker green for better contrast
                    },
                },
                error: {
                    style: {
                        background: '#b71c1c', // Darker red to match dark mode aesthetics
                    },
                },
                loading: {
                    style: {
                        background: '#4338CA', // Slightly different dark shade for variety
                    },
                },
            }}
        />
    );
};

export default GlobalToaster;