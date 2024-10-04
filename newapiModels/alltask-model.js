class alltaskmodel {
    constructor (taskUID, taskName, taskDateCreate, 
        taskPriority, taskInitiator, taskOrganization,
        taskNowExecutor, taskDateCompilet, taskCurrentStage,
        taskService, taskOrganizationClient, taskNumber) {


        this.taskUID                = taskUID;
        this.taskName               = taskName;
        this.taskDateCreate         = taskDateCreate;
        this.taskPriority           = taskPriority;
        this.taskInitiator          = taskInitiator;
        this.taskOrganization       = taskOrganization;
        this.taskNowExecutor        = taskNowExecutor;
        this.taskDateCompilet       = taskDateCompilet;
        this.taskCurrentStage       = taskCurrentStage;
        this.taskService            = taskService;
        this.taskOrganizationClient = taskOrganizationClient;
        this.taskNumber             = taskNumber;
    }
}

module.exports = alltaskmodel