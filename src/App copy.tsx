import { useState, type FormEvent } from 'react';

export type AuthUser = {
    ID: number;
    Name: string;
    Token: string;
};

type AuthFormProps = {
    onSuccess: (user: AuthUser) => void;
};

const AuthForm = ({ onSuccess }: AuthFormProps) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');

        const endpoint = isRegister ? '/api/users' : '/api/login';

        try {
            const response = await fetch(
                import.meta.env.VITE_SERVER_URL + endpoint,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, password }),
                },
            );

            if (!response.ok) {
                if (response.status === 401) {
                    setMessage('Wrong username or password.');
                } else if (response.status === 409) {
                    setMessage('That username is already taken.');
                } else {
                    setMessage('Please fill in both username and password.');
                }
                return;
            }

            const data = await response.json();

            if (data.Token) {
                localStorage.setItem('token', data.Token);
                localStorage.setItem('user', JSON.stringify(data));
                onSuccess(data);
            } else {
                // If /api/users creates the account without returning a token
                setMessage('Account created! Now log in.');
                setIsRegister(false);
                setPassword('');
            }
        } catch {
            setMessage('Could not reach the server.');
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <h2>{isRegister ? 'Register' : 'Login'}</h2>

            {message && <p className="auth-message">{message}</p>}

            <input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">{isRegister ? 'Register' : 'Login'}</button>

            <button
                type="button"
                onClick={() => {
                    setIsRegister(!isRegister);
                    setMessage('');
                }}
            >
                {isRegister
                    ? 'Already have an account? Login'
                    : 'Need an account? Register'}
            </button>
        </form>
    );
};

export default AuthForm;