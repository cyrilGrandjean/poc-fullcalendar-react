import {Root} from "react-dom/client";
import {useReducer} from "react";

export function useFooterRootManager() {
    type RootDictionary = {[key: string]: Root};
    type ReducerAction = {key: string, root?: Root}

    function reducer(state: RootDictionary, action: ReducerAction) {
        const currentState = Object.assign({}, state);
        if (action.root) {
            currentState[action.key] = action.root;
            return currentState
        } else {
            if (action.key in currentState) {
                currentState[action.key].unmount();
                delete currentState[action.key];
            }
            return currentState;
        }
    }


    const [state, dispatch] = useReducer(reducer, {})

    function addRoot(date: Date, root: Root) {
        dispatch({key: date.toISOString(), root})
    }

    function removeRoot(date: Date) {
        dispatch({key: date.toISOString()})
    }

    function hasRoot(date: Date) {
        return date.toISOString() in state;
    }

    function purgeRoot(startDate: Date, endDate: Date) {
        Object.keys(state)
            .map(key => new Date(key))
            .filter(date => startDate > date || date >= endDate)
            .forEach(date => removeRoot(date));
    }

    return {
        state,
        addRoot,
        removeRoot,
        hasRoot,
        purgeRoot
    }
}