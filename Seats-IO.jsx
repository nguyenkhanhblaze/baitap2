import { SeatsioClient, Region } from "seatsio";
import { createSignal, onMount } from "solid-js";
import { Card, Button, Toast, ToastContainer, Row, Col, Collapse, Spinner, ListGroup, Badge } from "solid-bootstrap";
import { createClient } from '@supabase/supabase-js';
import "./Seats-IO.css";

const SeatsIO = () => {
    const secretWorkSpaceKey = "fb329dc8-07ba-47e5-9b10-0757ca627f4d"
    const publicWorkSpaceKey = "c6f75c47-8d75-41ce-b0e4-e25ca0e9302a"
    const eventKeyChart = "8386cd67-3317-4518-b2df-84d905988877"
    const [ticketSelected, setTicketSelected] = createSignal([])
    const [ticketBooked, setTicketBooked] = createSignal([])
    const [isHandling, setIsHandling] = createSignal(false)
    const [showToggle, setShowToggle] = createSignal(false)
    const client = new SeatsioClient(Region.SA(), secretWorkSpaceKey)
    const supabase = createClient('https://vxudiapfzrpthkojjahj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dWRpYXBmenJwdGhrb2pqYWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY1NjQ3ODAsImV4cCI6MjAwMjE0MDc4MH0.hd9QH9zb0_e1lkztnvEjaa6wntSYKthtZMdyp8s3oZw')

    // Get seats data
    const pricing = [
        {
            // PREMIUM
            category: 1,
            ticketTypes: [
                {
                    ticketType: "Adult",
                    price: 110000,
                    label: "For adults",
                    description: "Seating size: 12inch seat(56 cm)",
                },
                {
                    ticketType: "Child",
                    price: 95000,
                    label: "For children",
                    description: "Seating size: 9.8inch seat(25 cm)",
                },
            ],
        },
        {
            // STANDARD
            category: 2,
            ticketTypes: [
                {
                    ticketType: "Adult",
                    price: 90000,
                    label: "For adults",
                    description: "Seating size: 12inch seat(56 cm)",
                },
                {
                    ticketType: "Child",
                    price: 75000,
                    label: "For children",
                    description: "Seating size: 9.8inch seat(25 cm)",
                },
            ],
        },
        { category: 3, price: 50000, originalPrice: 110000 },
    ]

    // Config to enable filter categories
    const categoryFilter = {
        enabled: true,
        multiSelect: true,
        zoomOnSelect: true,
    }

    // Format number as currency
    const priceFormatter = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    // Count total prices in ticket selected
    const totalPriceTicketSelected = () => {
        let counter = 0;
        ticketSelected().forEach(ele => {
            counter += ele.price
        })

        return counter
    }

    /**
     * Handle ticket selected on chart
     * 
     * @param {*} object 
     * @param {*} selectedTicketType 
     */
    const onObjectSelected = (object, selectedTicketType) => {
        if (isHandling()) {
            console.log('The booking function is handling')
            return
        }

        let itemSelected = {
            id: object.id,
            price: selectedTicketType.price,
            ticketType: selectedTicketType.ticketType,
            category: {
                key: object.category.key,
                label: object.category.label,
            }
        }
        setTicketSelected(ticketSelected => [itemSelected, ...ticketSelected])
    }

    /**
     * Handle ticket unselect on chart
     * 
     * @param {*} object 
     * @param {*} selectedTicketType 
     */
    const onObjectDeselected = (object, selectedTicketType) => {
        if (isHandling()) {
            console.log('The booking function is handling')
            return
        }

        setTicketSelected(ticketSelected().filter((e) => e.id !== object.id))
    }

    /**
     * Handle book ticket, storage in seats io and database
     * 
     * @param {*} data 
     * @param {*} event 
     */
    const bookTicket = async (data, event) => {
        console.log('handle booking ticket with data', data)
        event.preventDefault()
        setIsHandling(true)
        let seatIds = []

        // Insert into Supabase
        for (const ticket of ticketSelected()) {
            const { error } = await supabase
                .from('tickets')
                .insert({ ticket_id: ticket.id, category_id: ticket.category.key })
            ticketBooked().push({ ticket_id: ticket.id, category_id: ticket.category.key })
            seatIds.push(ticket.id)
        }

        // Insert into Seats IO
        await client.events.changeObjectStatus(eventKeyChart, seatIds, "booked").then(rs => {
            setTicketBooked(ticketBooked => [...ticketBooked])
            setTicketSelected([])
            console.log('ticket booked', ticketBooked())
            setIsHandling(false)
            showToggleTimeout()
        })
    }

    const showToggleTimeout = () => {
        setShowToggle(true)
        setTimeout(() => {
            setShowToggle(false)
        }, 5000)
    }

    /**
     * Clear all tickets selected
     * 
     * @param {*} data 
     * @param {*} event 
     */
    const clearAllTicket = async (data, event) => {
        console.log('handle clearing all ticket with data', data)
        event.preventDefault()
        setIsHandling(true)

        // Clear in Supabase
        const { error } = await supabase
            .from('tickets')
            .delete()
            .not('ticket_id', 'is', null)

        // Clear in Seats IO
        let seatIds = []
        ticketBooked().forEach(ele => {
            seatIds.push(ele.ticket_id)
        })
        await client.events.changeObjectStatus(eventKeyChart, seatIds, "free").then(rs => {
            setTicketBooked([])
            console.log('ticket released', seatIds)
            setIsHandling(false)
            showToggleTimeout()
        })
    }

    /**
     * Clear a ticket choosen
     * 
     * @param {*} id 
     * @param {*} event 
     */
    const clearTicket = async (id, event) => {
        console.log('handle clearing a ticket with data', id)
        event.preventDefault()
        setIsHandling(true)

        // Clear in Supabase
        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('ticket_id', id)

        // Clear in Seats IO
        await client.events.changeObjectStatus(eventKeyChart, id, "free").then(rs => {
            setTicketBooked(ticketBooked().filter((e) => e.ticket_id !== id))
            console.log('ticket released', id)
            setIsHandling(false)
            showToggleTimeout()
        })
    }

    const closeToggle = () => {
        setShowToggle(false)
    }

    onMount(() => {
        const createChart = () => {
            console.log('creating SeatsIO');
            new seatsio.SeatingChart({
                divId: "chart",
                workspaceKey: publicWorkSpaceKey,
                event: eventKeyChart,
                pricing: pricing,
                priceFormatter: priceFormatter,
                categoryFilter: categoryFilter,
                language: "en",
                loading: "<div class='lds-dual-ring'></div><h5>Loading...</h5>",
                fitTo: 'widthAndHeight',
                onObjectSelected: onObjectSelected,
                onObjectDeselected: onObjectDeselected
            }).render()
            console.log('SeatsIO is created');
        }
        const getTicketBooked = async () => {
            const { data, error } = await supabase
                .from('tickets')
                .select()
            setTicketBooked(data)
        }
        createChart()
        getTicketBooked()
    })

    return (
        <>
            <h1>Seats IO Chart</h1>
            <div id="chart" class="seatsio-chart"></div>
            <Row class="mt-1">
                <Col xs={5}>
                    <h5>Tickets have selected</h5>
                    {
                        ticketSelected().length > 0 ? (
                            <div class="card-booking-ticket">
                                <ul>
                                    <For each={ticketSelected()}>{(ticket) =>
                                        <li class="pt-1">
                                            <span class={ticket.category.key === 1 ? 'txt-premium-ticket' : 'txt-standard-ticket'}>{ticket.id}</span>, type: {ticket.ticketType}, price: {priceFormatter(ticket.price)}
                                        </li>
                                    }</For>
                                </ul>
                                <div>
                                    <Card style={{ width: '56vh' }}>
                                        <Card.Body>
                                            Total: <Badge pill bg="dark">{ticketSelected().length} {ticketSelected().length <= 1 ? 'seat' : 'seats'}</Badge> - <span style={{'font-weight': 'bold'}}>{priceFormatter(totalPriceTicketSelected())}</span>
                                            <Button style={{ width: '20vh' }} onClick={[bookTicket, 'book_ticket_selected']} class="ms-3" variant="dark">Book</Button>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <p>There's no ticket selected</p>
                        )
                    }
                </Col>
                <Col xs={4} style={{ "max-width": '350px' }}>
                    <h5>Tickets booked</h5>
                    {
                        ticketBooked().length > 0 ? (
                            <div class="card-booking-ticket">
                                <ListGroup variant="flush">
                                    <For each={ticketBooked()}>{(ticket, i) =>
                                        <ListGroup.Item>
                                            <Row>
                                                <Col xs={9}>{i() + 1}. <span class={ticket.category_id === 1 ? 'txt-premium-ticket' : 'txt-standard-ticket'}>{ticket.ticket_id}</span></Col>
                                                <Col><Button onClick={[clearTicket, ticket.ticket_id]} variant="dark" size="sm">x</Button></Col>
                                            </Row>
                                        </ListGroup.Item>
                                    }</For>
                                </ListGroup>
                                <Button style={{ width: '20vh' }} onClick={[clearAllTicket, 'clear_all_ticket_booked']} class="ms-3" variant="dark">Clear All</Button>
                            </div>
                        ) : (
                            <p>There's no ticket booked</p>
                        )
                    }
                </Col>
            </Row >

            {/* Toats Model */}
            <ToastContainer
                className="position-fixed bottom-0 end-0 p-3"
                style={{ zIndex: 1 }}
            >
                <Toast show={showToggle()} onClose={closeToggle()} animation transition={Collapse}>
                    <Toast.Header class="toast-header">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                        </svg>
                        <strong className="me-auto ms-1">Notification</strong>
                        <small>Just now</small>
                    </Toast.Header>
                    <Toast.Body class="toast-body">Function Success!</Toast.Body>
                </Toast>
            </ToastContainer>

            {/* Overlay Screen */}
            {
                isHandling() && (
                    <div class="overlay">
                        <div class="overlay__inner">
                            <div class="overlay__content"><span class="spinner"></span></div>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default SeatsIO