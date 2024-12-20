const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');
const https = require('https');
const axios = require('axios')
const itiluserShema = require('../models/itil-model')

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            let allowIndex = 0;
            
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидции!', errors.array()));
            }

            const allowEmail = [
                'altyntulpar.kg',
                'altyntulpar.com',
                'automall.kg',
                'bakr.kg',
                'bmw-center.kg',
                'byd-rm.uz',
                'chevrolet-auto.kg',
                'ducati.uz',
                'ducati.kg',
                'haval.kg',
                'happyhome.kz',
                'kia-bishkek.kg',
                'toyota-bishkek.kg',
                'lkwcenter.kg',
                'lexus-bishkek.kg',
                'toyota-royalmotors.uz',
                'royalmotors.uz',
                'tulparmotors.com'
            ]
            
            const {email, password} = req.body;

            let validationStr = String(email).split('@')[1]

            for (let i in allowEmail) {
                if (validationStr == allowEmail[i]) {
                    allowIndex += 1
                }
            }

            if (allowIndex > 0) {
                const userData = await userService.registration(email, password);
    
                res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true} );
    
                return res.json(userData);
            } else {
                return next(ApiError.BadRequest('Ошибка при валидации!'))
            }

        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            
            const userData = await userService.login(email, password);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true} );

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const {email, password} = req.body;

            const userData = await userService.resetPassword(email, password);

            return res.json(userData);
        } catch(e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            
            res.clearCookie('refreshToken');

            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async activate1(req, res, next) {
        try {
            const activationLink = req.params.link;

            await userService.activate1(activationLink);
            
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async activate2(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate2(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async activate3(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate3(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            
            const userData = await userService.refresh(refreshToken);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true} );

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();

            return res.json(users);
        } catch (e) {
            next(e);
        }
    }

    async getItilUsers(req, res, next) {
        try {
            const itiluser = await userService.getItilUser()

            return res.json(itiluser)
        } catch (e) {
            next(e)
        }
    }

    async getOneCompany(req, res, next) {
        try {
            const oneCompanyItil = await userService.getOneCompany(req.params.uid)

            return res.json(oneCompanyItil)
        } catch (e) {
            next(e)
        }
    }

    async setTask(req, res, next) {
        try {
            const obj = req.body[0]

            const setTask = await userService.setTask(obj, req.params.email)

            return res.json(setTask)
        } catch (e) {
            next(e)
        }
    }

    async getComment(req, res, next) {
        try {
            const comment = await userService.getComment(req.params.uid, req.params.tasktype)

            return res.json(comment)
        } catch (e) {
            next(e)
        }
    }

    async getOneTask(req, res, next) {
        try{
            const oneTask = await userService.getOneTask(req.params.uid, req.params.tasktype)

            return res.json(oneTask)
        } catch(e) {
            next(e)
        }
    }

    async setComment(req, res, next) {
        try {
            await userService.setNewComment(req.body[0], req.params.uid, req.params.tasktype)

            return '200'
        } catch (e) {
            next(e)
        }
    }

    async getAllTask(req, res, next) {
        try {
            const allTask = await userService.getAllTask(req.params.email)

            return res.json(allTask)
        } catch (e) {
            next(e)
        }
    }

    async getAllEmail(req, res, next) {
        try {
            const allEmail = await userService.getAllEmail(req.params.email)
        
            return res.json(allEmail)
        } catch (e) {
            next(e)
        }
    }

    async getAA6(req, res, next) {
        try {
            const AA6Succes = await userService.getAA6(req.params.email)

            return res.json(AA6Succes)
        } catch (e) {
            next(e)
        }
    }

    async getSoglCreate1cAA6(req, res, next) {
        try {
            const responce = await userService.getSoglCreate1cSogl(req.params.taskuid, req.params.usernumber, req.params.soglnumber)
        
            return res.redirect(`${process.env.CLIENT_URL}/sogl/${req.params.soglnumber}`);
        } catch (e) {
            next(e)
        }
    }

    

    async getDataloreItil(req, res, next) {
        try {
            const responce = await userService.getDataloreItil()

            return res.json(responce)
        } catch (e) {
            next(e)
        }
    }


    // новая версия апи

    async getLastTask(req, res, next) {
        try {
            const responce = await userService.getLastTask()

            return res.json(responce)
        } catch(e) {
            next(e)
        }
    }

    async getAllTasks(req, res, next) {
        try {
            const responce = await userService.getAllTasks()

            return res.json(responce)
        } catch(e) {
            next(e)
        }
    }

    async getItilOneUser(req, res, next) {
        try {
            const responce = await userService.getItilOneUser(req.params.email)

            return res.json(responce)
        } catch(e) {
            next(e)
        }
    }

    async getOneTaskComment(req, res, next) {
        try {
            const responce = await userService.getOneTaskItilComment(req.params.uuid)

            return res.json(responce)
        } catch(e) {
            next(e)
        }
    }

    async setNewComment(req, res, next) {
        try {
            const responce = await userService.setNewCommentItil(req.body[0], req.params.uuid)

            return '200'
        } catch(e) {
            next(e)
        }
    }

    async setTaskapi2(req, res, next) {
        try {
            const responce = await userService.setTaskapi20(req.body[0], req.params.taskarrow)

            return res.json(responce);
        } catch(e) {
            next(e)
        }
    }

    async sogl(req, res, next) {
        try {
            const responce = await userService.sogl(req.params.taskuid, req.params.userNumber, req.params.soglnumber, req.params.soglArrow)

            return res.redirect(`${process.env.CLIENT_URL}/home`)
        } catch(e) {
            next(e)
        }
    }
}

module.exports = new UserController();