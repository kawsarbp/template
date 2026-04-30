import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

const useAxiosFetch = ({ url, skip = false }, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const memoizedOptions = useMemo(() => {
        return {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        };
    }, [JSON.stringify(options)]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios(url, memoizedOptions);
                setData(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        if (!skip) {
            fetchData();

        } else {
            setLoading(false)
        }

    }, [url, memoizedOptions]);

    return { data, loading, error };
};

export default useAxiosFetch;
