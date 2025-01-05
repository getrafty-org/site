import { useSsrSafeState } from "../_hooks/useSsrSafeState.js";

export default function Counter({ initialCount = 0 }) {
    const [count, setCount] = useSsrSafeState(initialCount);

    return (
        <div data-component="Counter">
            <p>Count: {count}</p>
            <button onClick={() => setCount((n) => n + 1)}>Increment</button>
        </div>
    );
}
