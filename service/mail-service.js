const { text } = require('express');
const nodemailer = require('nodemailer');

class MailSevice {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    } 

    async sendActivationMail(to, link, email) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация Аккаунта Атт24',
            text: '',
            html: `
                <div>
                    <h1>Почта пользователя: ${email}</h1>
                    <h1>Для активации перейдите по ссылке:</h1>
                    <a href="${link}/1"> Подтвердить Права Обычного Пользователя <a/> <br />
                    <a href="${link}/2"> Подтвердить Расширенные Права Пользователя <a/> <br />
                    <a href="${link}/3"> Подтвердить Права Администратора <a/> <br />
                </div>
            `
        })
    }

    async sendPassword(to, email, password) {
        await this.transporter.sendMail({
            from: email,
            to,
            subject: 'Восстановление пароля ATT24',
            text: '',
            html: `
                <div>
                    <h1>Добрый день! Вы восстановили пароль на сайте АТТ24</h1>
                    <a href="https://att24.altyntulpar.kg">АТТ24</a> <br />

                    <p>Ваш пароль: ${password}</p>
                    <br />
                    <p>Если Вы не запрашивали письмо с паролем, то как можно скорее обратитесь в IT Департамент!</p>
                </div>
            `
        })
    }
}

module.exports = new MailSevice()