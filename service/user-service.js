const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenSevice = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const { refresh } = require('../controllers/user-controller');
const axios = require('axios')
const https = require('https')
const itiluserShema = require('../models/itil-model');
const oneCompanyItil = require('../models/company-itil-model');
const commentModel = require('../models/comment-model');
const oneTaskModel = require('../models/oneTask-model');
const allEmail = require('../models/email-model');
const dataloreItil = require('../models/dataloreItil-model');
const lasttaskmodel = require('../newapiModels/lasttask-model');
const itilOneUser = require('../newapiModels/itilOneUser-model');
const itilOneTaskComment = require('../newapiModels/itilOneTaskComment-model');
const alltaskmodel = require('../newapiModels/alltask-model');

class UserSevice {
    async registration(email, password) {
        const candidate = await UserModel.findOne( {email} );   

        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        };

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await UserModel.create({email, password: hashPassword, activationLink});
    

        await mailService.sendActivationMail(process.env.SMTP_USER, `${process.env.API_URL}/api/activate/${activationLink}`, email);

        const userDto = new UserDto(user);
        const tokens = tokenSevice.generateTokens( {...userDto} );

        await tokenSevice.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        }
    }

    async resetPassword(email, password) {
        const user = await UserModel.findOne({email})

        if (!user) {
            throw ApiError.BadRequest('Такой почты нет в базе!')
        }

        const hashPassword = await bcrypt.hash(password, 3)
        user.password = hashPassword;

        await user.save()
    }

    async activate1(activationLink) {
        const user = await UserModel.findOne({activationLink})

        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }

        user.isActivated = true;
        user.admin = 1;
        await user.save();
    }

    async activate2(activationLink) {
        const user = await UserModel.findOne({activationLink})

        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }

        user.isActivated = true;
        user.admin = 2;
        
        await user.save();
    }

    async activate3(activationLink) {
        const user = await UserModel.findOne({activationLink})

        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }

        user.isActivated = true;
        user.admin = 3;
        await user.save();
    }

    async login(email, password) {
        const user = await UserModel.findOne({email})

        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким Email не найден!')
        }

        const isPassEquals = await bcrypt.compare(password, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }

        const userDto = new UserDto(user);
        const tokens = tokenSevice.generateTokens({...userDto});

        await tokenSevice.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        const token = tokenSevice.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnathorizedError();
        }

        const userData = tokenSevice.validateRefreshToken(refreshToken);
        const tokenFromDb = tokenSevice.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnathorizedError();
        }

        const user = await UserModel.findById(userData.id)
        const userDto = new UserDto(user);
        const tokens = tokenSevice.generateTokens({...userDto});

        await tokenSevice.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }

    async getItilUser() {
        // const agent = new https.Agent({
        //     rejectUnauthorized: false
        // })        

        try {
            const itiluser = await axios.get(`${process.env.API_ITIL}/users`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return itiluser.data.map(user => new itiluserShema(user.ОсновнойEmail, user.Наименование, user.Уид))
        } catch (e) {
            next(e)
        }
    }

    async getOneCompany(uid) {
        const onecompany = await axios.get(`${process.env.API_ITIL}/company/${uid}`, {
            auth: {
                username: 'WebInterface',
                password: '90nexuB'
            }
        })

        return onecompany.data.map(company => new oneCompanyItil(company.Организация))
    }

    async setTask(obj, email) {
        const setonetask = await axios.post(`${process.env.API_ITIL}/settask/${email}`, obj,{
            auth: {
                username: 'WebInterface',
                password: '90nexuB'
            }
        })

        return '200'
    }



    async getComment(uid, tasktype) {
        try {   
            const res = await axios.get(`${process.env.API_ITIL}/comment/${uid}/${tasktype}`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return res.data.map(comment => new commentModel(comment.UserName, comment.Текст, comment.Дата))
        } catch (e) {
            return e
        }
    }

    async getOneTask(uid, tasktype) {
        try {
            const res = await axios.get(`${process.env.API_ITIL}/getonetask/${uid}/${tasktype}`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return res.data.map(onetask => new oneTaskModel(onetask.CurrentStage,
                                                            onetask.DateOfCompletion,
                                                            onetask.DateOfCreation,
                                                            onetask.Executor,
                                                            onetask.Initiator,
                                                            onetask.Number,
                                                            onetask.OrganizationClient,
                                                            onetask.OrganizationExecutor,
                                                            onetask.Priority,
                                                            onetask.Service,
                                                            onetask.TaskName,
                                                            onetask.TaskType,
                                                            onetask.UID
                                                        ))
        } catch (e) {
            return e
        }
    }

    async setNewComment(obj, uid, tasktype) {
        await axios.post(`${process.env.API_ITIL}/comment/${uid}/${tasktype}`, obj, {
            auth: {
                username: 'WebInterface',
                password: '90nexuB'
            }
        })

        return '200'
    }

    async getAllTask(email) {
        try {
            const allTask = await axios.get(`${process.env.API_ITIL}/tasksget/${email}`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return allTask.data.map(onetask => new oneTaskModel(onetask.CurrentStage,
                                                            onetask.DateOfCompletion,
                                                            onetask.DateOfCreation,
                                                            onetask.Executor,
                                                            onetask.Initiator,
                                                            onetask.Number,
                                                            onetask.OrganizationClient,
                                                            onetask.OrganizationExecutor,
                                                            onetask.Priority,
                                                            onetask.Service,
                                                            onetask.TaskName,
                                                            onetask.TaskType,
                                                            onetask.UID
            ))
        } catch (e) {
            return e
        }
    }

    async getAllEmail(email) {
        const oneEmail = await axios.get(`${process.env.API_ITIL}/getallemail/${email}`, {
            auth: {
                username: 'WebInterface',
                password: '90nexuB'
            }
        })
        
        if (oneEmail.data !== null) {
            return oneEmail.data.map(oneEmail => new allEmail(oneEmail.email))
        } else {
            return []
        }        
    }

    async getAA6(email) {
        const AA6Succes = await axios.get(`${process.env.API_ITIL}/getaa6users/${email}`, {
            auth: {
                username: 'WebInterface',
                password: '90nexuB'
            }
        })

        if (AA6Succes.data !== null) {
            return AA6Succes.data.map(oneUser => new allEmail(oneUser))
        } else {
            return []
        }
    }

    async getSoglCreate1cSogl(uid, userNumber, soglnumber) {
        try {
            const res = await axios.get(`${process.env.API_ITIL}/createonessogl/${uid}/${userNumber}/${soglnumber}`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })
        } catch (e) {
            return e
        }
    }



    async getDataloreItil() {
        try {
            const res = await axios.get(`${process.env.API_ITIL}/datalore`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return res.data.map((oneDataloreItem) => new dataloreItil(oneDataloreItem.loreName, oneDataloreItem.loreDescr, oneDataloreItem.lorePng, oneDataloreItem.lorePR))
        } catch (e) {
            return e
        }
    }

    //новая версия апи

    async getLastTask() {
        try {
            const res = await axios.get(`${process.env.API_ITIL_NEW}/lasttask`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return res.data.map((oneLastTask) => new lasttaskmodel(oneLastTask.taskUID,         oneLastTask.taskName,               oneLastTask.taskDateCreate,
                                                                   oneLastTask.taskPriority,    oneLastTask.taskInitiator,          oneLastTask.taskOrganization,
                                                                   oneLastTask.taskNowExecutor, oneLastTask.taskDateCompilet,       oneLastTask.taskCurrentStage,
                                                                   oneLastTask.taskService,     oneLastTask.taskOrganizationClient, oneLastTask.taskNumber
            ))
        } catch(e) {
            return e
        }
    }

    async getAllTasks() {
        try {
            const res = await axios.get(`${process.env.API_ITIL_NEW}/alltasks`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return res.data.map((oneAllTasks) => new alltaskmodel(oneAllTasks.taskUID,         oneAllTasks.taskName,               oneAllTasks.taskDateCreate,
                                                               oneAllTasks.taskPriority,    oneAllTasks.taskInitiator,          oneAllTasks.taskOrganization,
                                                               oneAllTasks.taskNowExecutor, oneAllTasks.taskDateCompilet,       oneAllTasks.taskCurrentStage,
                                                               oneAllTasks.taskService,     oneAllTasks.taskOrganizationClient, oneAllTasks.taskNumber
            ))
        } catch(e) {
            return e
        }
    }

    async getItilOneUser(email) {
        try {
            const res = await axios.get(`${process.env.API_ITIL_NEW}/oneuser/${email}`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return res.data.map((oneUser) => new itilOneUser(oneUser.name,         oneUser.secondName, oneUser.surname,
                                                             oneUser.fullName,     oneUser.email,      oneUser.phoneNumber, 
                                                             oneUser.organization, oneUser.jobTitle,   oneUser.subdivision, 
                                                             oneUser.dateOfBirth,  oneUser.UID
            ))
        } catch (e) {
            return e
        }
    }

    async getOneTaskItilComment(uuid) {
        try {
            const res = await axios.get(`${process.env.API_ITIL_NEW}/comment/${uuid}`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })

            return res.data.map((oneComment) => new itilOneTaskComment(oneComment.commentDate, oneComment.commentText,
                                                                       oneComment.commentUser, oneComment.commentShow
            ))
        } catch (e) {
            return e;
        }
    }

    async setNewCommentItil(obj, uuid) {
        const responce = await axios.post(`${process.env.API_ITIL_NEW}/comment/${uuid}`, obj, {
            auth: {
                username: 'WebInterface',
                password: '90nexuB'
            }
        })

        return '200'
    }

    async setTaskapi20(obj, taskarrow) {
        const responce = await axios.post(`${process.env.API_ITIL_NEW}/tasks/${taskarrow}`, obj, {
            auth: {
                username: 'WebInterface',
                password: '90nexuB'
            }
        })

        return '200'
    }

    async sogl(uuid, userNumber, soglnumber, soglArrow) {
        try {
            const res = await axios.get(`${process.env.API_ITIL_NEW}/accesssogl/${uuid}/${userNumber}/${soglnumber}/${soglArrow}`, {
                auth: {
                    username: 'WebInterface',
                    password: '90nexuB'
                }
            })
        } catch(e) {
            return e
        }
    }
}

module.exports = new UserSevice()
