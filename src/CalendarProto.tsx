import './App.css'
import FullCalendar from '@fullcalendar/react';
import {DateSelectArg, EventInput, DateSpanApi} from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {useEffect, useRef, useState} from 'react';

function formatDateFullCalendar(date: Date) {
    return new Intl.DateTimeFormat('fr', {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    }).format(date).split('/').reverse().join('-');
}

function buildEventUnavailable(date: Date): EventInput {
    return {
        start: formatDateFullCalendar(date),
        end: formatDateFullCalendar(date),
        display: 'background',
        className: 'unavailable',
    }
}

function buildEventSubOptions(date: Date): EventInput {
    return {
        start: formatDateFullCalendar(date),
        end: formatDateFullCalendar(date),
        display: 'background',
        className: 'subOptions',
    }
}

function buildEventSelectedDate(date: Date): EventInput {
    return {
        start: formatDateFullCalendar(date),
        end: formatDateFullCalendar(date),
        display: 'background',
        className: 'selected',
    }
}

function CalendarProto() {
    const calendarRef = useRef<FullCalendar>(null);
    const [selectedDate, setSelecetedDate] = useState<Date[]>([]);
    const [unavailableDate, setUnavailableDate] = useState<Date[]>([]);
    const [subOptionsDate, setSubOptionsDate] = useState<Date[]>([]);
    const [eventInputList, setEventInputList] = useState<EventInput[]>([]);
    const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
    const [ctrlKeyPressed, setCtrlKeyPressed] = useState<boolean>(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            setShiftKeyPressed(event.shiftKey);
            setCtrlKeyPressed(event.ctrlKey);
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.shiftKey !== shiftKeyPressed) {
                setShiftKeyPressed(false);
            }
            if (event.ctrlKey !== ctrlKeyPressed) {
                setCtrlKeyPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [shiftKeyPressed, ctrlKeyPressed]);

    useEffect(() => {
        setUnavailableDate([
            new Date('2025-02-11'),
            new Date('2025-02-13'),
            new Date('2025-02-15'),
            new Date('2025-02-19')
        ]);

        setSubOptionsDate([
            new Date('2025-02-10'),
            new Date('2025-02-14'),
            new Date('2025-02-16'),
            new Date('2025-02-20')
        ]);
    }, []);

    useEffect(() => {
        const unavailableEventInput = unavailableDate.map(date => buildEventUnavailable(date));
        const subOptionsEventInput = subOptionsDate.map(date => buildEventSubOptions(date));
        const selectedEventInput = selectedDate.map(date => buildEventSelectedDate(date));
        const eventInputs = uniqueBackgroundEventInput(selectedEventInput, unavailableEventInput, subOptionsEventInput);
        setEventInputList(eventInputs);
    }, [selectedDate, unavailableDate, subOptionsDate]);

    function uniqueBackgroundEventInput(
        selectedEventInputs: EventInput[],
        unavailableEventInputs: EventInput[],
        subOptionsEventInputs: EventInput[],
    ): EventInput[] {
        const selectedEventInputSet = new Set(selectedEventInputs.map(x => x.start));
        const unavailableFilter = unavailableEventInputs.filter(x => !selectedEventInputSet.has(x.start))
        const subOptionsFilter = subOptionsEventInputs.filter(x => !selectedEventInputSet.has(x.start))
        return [...selectedEventInputs, ...unavailableFilter, ...subOptionsFilter];
    }

    function getRangeDate(startDate: Date, endDate: Date): Date[] {
        const dates: Date[] = [];

        while (startDate < endDate) {
            dates.push(new Date(startDate)); // Format YYYY-MM-DD
            startDate.setDate(startDate.getDate() + 1);
        }

        return dates;
    }

    function getDifferentDates(list1: Date[], list2: Date[]): Date[] {
        const set1 = new Set(list1.map(date => date.toISOString()));
        const set2 = new Set(list2.map(date => date.toISOString()));

        return [
            ...list1.filter(date => !set2.has(date.toISOString())),
            ...list2.filter(date => !set1.has(date.toISOString()))
        ];
    }

    function handleSelectedDateChange(dateSelectArg: DateSelectArg) {
        const startDate = new Date(dateSelectArg.startStr);
        const endDate = new Date(dateSelectArg.endStr);
        const dateRange = getRangeDate(startDate, endDate)
        const test = getDifferentDates(selectedDate, dateRange)
        setSelecetedDate(test);
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.unselect();
        }
    }


    function selectAllowDate(dateSpanApi: DateSpanApi) {
        const start = new Date(dateSpanApi.startStr);
        const end = new Date(dateSpanApi.endStr);
        end.setDate(end.getDate() - 1);
        return start.toDateString() == end.toDateString();
    }

    return (
        <>
            <div style={{width: '1000px'}}>
                <FullCalendar
                    ref={calendarRef}
                    selectable={true}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView='dayGridMonth'
                    events={eventInputList}
                    select={e => handleSelectedDateChange(e)}
                    selectAllow={e => selectAllowDate(e)}
                />
            </div>
        </>
    )
}

export default CalendarProto
