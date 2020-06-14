## Part #1 Function vs Class

Необходимо реализовать несколько видов "NotificationMessage" компонент, а именно:

* SuccessNotificationMessage
* WarningNotificationMessage
* ErrorNotificationMessage

"SuccessNotificationMessage" и "WarningNotificationMessage" ничем не будут отличаться кроме визуального
отображения (см. файл static.html)

"ErrorNotificationMessage" будет иметь дополнительную особенность: не принимает параметр "duration" и
может быть удалена из DOM только по клику на кнопку (см. файл static.html)

Для реализации можно использовать как функции так и классы. 

## Part 2 "NotificationManager" компонент

Необходимо реализовать "NotificationManager" компонент, цель которого управление
отображением "NotificationMessage" компонент на страницы.

"NotificationManager" компонент при инициализации должен принимать параметр `stackLimit`,
который будет ограничивать количество одновременно присутствующих на странице "NotificationMessage" 
компонент. 

Если количество сообщений достигло `stackLimit`, то при добавлении нового "NotificationMessage", 
одно из старых сообщений удаляется. Данное ограничение не распространяется на "ErrorNotificationMessage"

После реализации "NotificationManager" компонента, логика ограничения показа больше одного сообщения 
должна быть убрана из "NotificationMessage" компонента

См. пример: 
["NotificationManager" компонент](https://glitch.com/edit/#!/notification-manager-js-20200203)
