import './App.css'
import FullCalendar from '@fullcalendar/react';
import {DateSelectArg, DayCellContentArg, EventInput} from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {useEffect, useRef, useState} from 'react';

function formatPrice(price: number) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}

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

function buildEventReservedDate(title: string, startDate: Date, endDate: Date): EventInput {
    const endDateForFullCalendar = new Date(endDate);
    endDateForFullCalendar.setDate(endDateForFullCalendar.getDate() + 1);
    return {
        title: title,
        start: formatDateFullCalendar(startDate),
        end: formatDateFullCalendar(endDateForFullCalendar),
    }
}


export function CalendarProto2() {
    const calendarRef = useRef<FullCalendar>(null);
    const [selectedDate, setSelecetedDate] = useState<Date[]>([]);
    const [unavailableDate, setUnavailableDate] = useState<Date[]>([]);
    const [subOptionsDate, setSubOptionsDate] = useState<Date[]>([]);
    const [eventInputList, setEventInputList] = useState<EventInput[]>([]);
    const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            setShiftKeyPressed(event.shiftKey);
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.shiftKey !== shiftKeyPressed) {
                setShiftKeyPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [shiftKeyPressed]);

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
        const startDateClone = new Date(startDate);

        while (startDateClone < endDate) {
            dates.push(new Date(startDateClone)); // Format YYYY-MM-DD
            startDateClone.setDate(startDateClone.getDate() + 1);
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
        let dateRange = getRangeDate(startDate, endDate)

        if (shiftKeyPressed) {
            setSelecetedDate(getDifferentDates(selectedDate, dateRange));
        } else {
            if (!getDifferentDates(selectedDate, dateRange).length) {
                dateRange = []
            }
            setSelecetedDate(dateRange);
        }
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.unselect();
        }
    }

    function handleDayCellDidMount(args: DayCellContentArg & { el: HTMLElement }) {
        const buildingPrice = Math.random() * 5;
        const meadowPrice = Math.random() * 5;

        const dayGridDayFooter = document.createElement('div');
        dayGridDayFooter.className = 'fc-daygrid-day-footer';
        if (meadowPrice) {
            const meadowPriceElement = document.createElement('div');
            meadowPriceElement.className = 'fc-daygrid-day-number';
            meadowPriceElement.innerHTML = 'm' + formatPrice(meadowPrice);
            dayGridDayFooter.appendChild(meadowPriceElement);
        }
        if (buildingPrice) {
            const buildingPriceElement = document.createElement('div');
            buildingPriceElement.className = 'fc-daygrid-day-number';
            buildingPriceElement.innerHTML = 'b' + formatPrice(buildingPrice);
            dayGridDayFooter.appendChild(buildingPriceElement);
        }

        args.el.appendChild(dayGridDayFooter);
    }


    const eventTest: EventInput[] = [
        buildEventReservedDate('Une event de plusieur jour', new Date('2025-03-02'), new Date('2025-03-06')),
        buildEventReservedDate('Une event', new Date('2025-03-20'), new Date('2025-03-20'))
    ]

    return (
        <>
            <div style={{width: '1000px'}}>
                <FullCalendar
                    ref={calendarRef}
                    selectable={true}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView='dayGridMonth'
                    events={[...eventInputList, ...eventTest]}
                    select={e => handleSelectedDateChange(e)}
                    dayCellDidMount={args => handleDayCellDidMount(args)}
                />
            </div>
        </>
    )
}
