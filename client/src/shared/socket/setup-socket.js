// import { io } from 'socket.io-client'
// import { LIS } from '../../helpers/lis.js'
// const polygon = L.polygon([
//     [-0.9008789062499999, 32.02670629333614],
//     [7.09716796875, 32.02670629333614],
//     [7.09716796875, 34.687427949314845],
//     [-0.9008789062499999, 34.687427949314845],
//     [-0.9008789062499999, 32.02670629333614],
// ])
// const bounds = polygon.getBounds()
// const x_max = bounds.getEast()
// const x_min = bounds.getWest()
// const y_max = bounds.getSouth()
// const y_min = bounds.getNorth()
// export const setupSocket = () => {
//     // On signal from server remove all listings with some ID in all clients
//     // TODO: process.env.NODE_ENV to replace constant localhost domain
//     const socket = io('http://localhost:3000')
//     socket.on('broadcast', function (data) {
//         console.log('Socket data recieved', data)
//         try {
//             LIS.remove(data)
//         } catch (error) { /* empty */ }
//     })
//     // const population = [];
//     // socket.on("marker", data => {
//     //   console.log('added marker', data);
//     //   population.push(data);
//     // });
//     ;(function myLoop(i) {
//         setTimeout(function () {
//             const lat = y_min + Math.random() * (y_max - y_min)
//             const lng = x_min + Math.random() * (x_max - x_min)
//             socket.emit('marker', [lat, lng]) //  your code here
//             if (--i) {
//                 myLoop(i)
//             } //  decrement i and call myLoop again if i > 0
//         }, 3000)
//     })(15) //  pass the number of iterations as an argument
// }
