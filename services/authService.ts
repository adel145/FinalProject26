import { UserProfile, UserRole, Language, HistoryEvent } from '../types';
import { useStore } from './store';

const MOCK_OTP = "123456";

export const authService = {
    // Stage 1: Request OTP
    requestOtp: async (phone: string): Promise<boolean> => {
        useStore.getState().addHistory({ action: 'login', metadata: { stage: 'request_otp', phone } });
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Simulate Rate Limit: if phone ends with 9, fail
        if (phone.endsWith('9')) throw new Error("יותר מדי ניסיונות. נסה שוב מאוחר יותר.");
        return true;
    },

    // Stage 2: Verify OTP and Login
    verifyOtp: async (phone: string, code: string, role: UserRole, language: Language): Promise<UserProfile> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (code !== MOCK_OTP) {
            useStore.getState().addHistory({ action: 'login', metadata: { stage: 'verify_fail', phone } });
            throw new Error("קוד שגוי");
        }

        const user: UserProfile = {
            id: 'u_' + phone.replace(/\D/g, ''),
            name: role === 'professional' ? 'אבי האינסטלטור' : 'דוד כהן',
            phone: phone,
            role: role,
            language: language,
            avatar: 'https://i.pravatar.cc/150?u=' + phone,
            createdAt: Date.now(),
            location: { lat: 32.0853, lng: 34.7818, address: "תל אביב" } // Default
        };

        useStore.getState().setUser(user);
        useStore.getState().setLanguage(language);
        useStore.getState().addHistory({ action: 'login', metadata: { stage: 'success', userId: user.id } });
        
        return user;
    }
};