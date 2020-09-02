'use strict';


const _ = require('underscore');
const assert = require('assert');


const JobRolesHelper = require('./JobRoles.helper');
const ProjectsHelper = require('../projects/Projects.helper');
const UtilizationHelper = require('../utilization/Utilization.helper');


const MockJobRolesRepository = require('./MockJobRolesRepository.helper');
const MockProjectsRepository = require('../projects/MockProjectsRepository.helper');
const MockUtilizationRepository = require('../utilization/MockUtilizationRepository.helper');


const JobRolesService = require('../../../server/modules/jobRoles/JobRolesService');


const mockJobRolesRepository = new MockJobRolesRepository();
const mockProjectsRepository = new MockProjectsRepository();
const mockUtilizationRepository = new MockUtilizationRepository();
const jobRolesService = new JobRolesService(mockJobRolesRepository,
  mockProjectsRepository,
  mockUtilizationRepository);


let testJobRoleA = undefined;
let testJobRoleB = undefined;
let testProjectA = undefined;
let testProjectB = undefined;
let testUtilizationA = undefined;
let testUtilizationB = undefined;
function createTestDataBeforeTest() {
  // Clearing the databases
  mockJobRolesRepository.clearDatabase();
  mockProjectsRepository.clearDatabase();
  mockUtilizationRepository.clearDatabase();


  // Creating fake test data.
  testJobRoleA = JobRolesHelper.getTemplate();
  testJobRoleA._id = '1444';
  testJobRoleA.name = 'Role A';
  mockJobRolesRepository.testJobRolesDatabase[testJobRoleA._id] = testJobRoleA;

  testJobRoleB = JobRolesHelper.getTemplate();
  testJobRoleB._id = '1650';
  testJobRoleB.name = 'Role B';
  mockJobRolesRepository.testJobRolesDatabase[testJobRoleB._id] = testJobRoleB;


  testProjectA = ProjectsHelper.getTemplate();
  testProjectA._id = '42';
  testProjectA.name = 'Project A';
  testProjectA.team = [
    {
      name: 'Member A',
      job_role: testJobRoleA.name,
    },
    {
      name: 'Member B',
      job_role: testJobRoleB.name,
    },
  ];
  mockProjectsRepository.testProjectsDatabase[testProjectA._id] = testProjectA;

  testProjectB = ProjectsHelper.getTemplate();
  testProjectB._id = '43';
  testProjectB.name = 'Project B';
  testProjectB.team = [
    {
      name: 'Member B',
      job_role: testJobRoleB.name,
    },
  ];
  mockProjectsRepository.testProjectsDatabase[testProjectB._id] = testProjectB;


  testUtilizationA = UtilizationHelper.getTemplate();
  testUtilizationA._id = '2200';
  testUtilizationA.name = 'Utilization A';
  testUtilizationA.projects = [
    {
      utilization: [
        {
          name: 'Util A',
          job_role: testJobRoleB.name,
        },
        {
          name: 'Util B',
          job_role: testJobRoleA.name,
        },
      ],
    },
  ];
  mockUtilizationRepository.testUtilizationDatabase[testUtilizationA._id] = testUtilizationA;

  testUtilizationB = UtilizationHelper.getTemplate();
  testUtilizationB._id = '2300';
  testUtilizationB.name = 'Utilization B';
  testUtilizationB.projects = [
    {
      utilization: [
        {
          name: 'Util A',
          job_role: testJobRoleB.name,
        },
        {
          name: 'Util B',
          job_role: testJobRoleB.name,
        },
      ],
    },
  ];
  mockUtilizationRepository.testUtilizationDatabase[testUtilizationB._id] = testUtilizationB;
}


describe('JobRolesService', function JobRolesServiceTest() {
  this.timeout(2000);


  it('add', () => {
    it('Should add the document to the database, and return its id.', (done) => {
      const testDocument = JobRolesHelper.getTemplate();
      jobRolesService.add(testDocument.name,
        testDocument.description,
        testDocument.created_by)
        .then((id) => {
          try {
            assert(id === mockJobRolesRepository.nextId, 'Read id did not match inserted id.');
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });
  });


  describe('delete', () => {
    beforeEach(createTestDataBeforeTest);


    it('Should delete the document from the database.', (done) => {
      jobRolesService.delete(testJobRoleA._id)
        .then(() => {
          try {
            // We shouldn't find the document in the database.
            const resultDocument = mockJobRolesRepository.testJobRolesDatabase[testJobRoleA._id];
            assert(!resultDocument, 'The JobRole document was not deleted.');
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });
  });


  describe('getJobRole', () => {
    beforeEach(createTestDataBeforeTest);


    it('Should get the JobRole that has the specified id.', (done) => {
      jobRolesService.getJobRole(testJobRoleA._id)
        .then((document) => {
          try {
            assert(document._id === testJobRoleA._id, 'The incorrect document was returned.');
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });
  });


  describe('getJobRoles', () => {
    beforeEach(createTestDataBeforeTest);


    it('Should return all of the JobRole documents.', (done) => {
      jobRolesService.getJobRoles()
        .then((documents) => {
          try {
            assert(documents.docs.length === 2, 'Both JobRoles were not returned.');
            const missingJobRoles = [testJobRoleA, testJobRoleB];

            const readJobRole1 = documents.docs[0];
            let missingJobRoleIndex = missingJobRoles.indexOf(readJobRole1);
            missingJobRoles.splice(missingJobRoleIndex, 1);

            const readJobRole2 = documents.docs[1];
            missingJobRoleIndex = missingJobRoles.indexOf(readJobRole2);
            missingJobRoles.splice(missingJobRoleIndex, 1);
            assert(missingJobRoles.length === 0, 'At least one category was not returned.');
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });
  });


  describe('update', () => {
    beforeEach(createTestDataBeforeTest);


    it('Should update the JobRole document.', (done) => {
      const newName = 'Novus Name';
      const newDescription = 'Novus Description';
      const modifierUserId = 'Novus Modifier';
      jobRolesService.update(testJobRoleA._id,
        newName,
        newDescription,
        modifierUserId)
        .then(() => {
          const jobRoleDocument = mockJobRolesRepository.testJobRolesDatabase[testJobRoleA._id];
          assert(jobRoleDocument.name === newName, 'The name was not updated.');
          assert(jobRoleDocument.description === newDescription,
           'The description was not updated.');
          assert(jobRoleDocument.modified_by === modifierUserId,
           'The modified_by field was not updated.');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should update the JobRole name, of teams in projects that have the previous job role\'s '
      + ' name', (done) => {
      const newName = 'Novus Name';
      const newDescription = 'Novus Description';
      const modifierUserId = 'Novus Modifier';
      jobRolesService.update(testJobRoleA._id,
        newName,
        newDescription,
        modifierUserId)
        .then(() => {
          const projectADocument = mockProjectsRepository.testProjectsDatabase[testProjectA._id];
          const projectATeam = projectADocument.team;
          assert(projectATeam[0].job_role === newName,
           'The job_role for the project\'s team was not updated.');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should not update the JobRole name, of teams in projects that do not have'
     + ' the previous job role\'s name', (done) => {
      const newName = 'Novus Name';
      const newDescription = 'Novus Description';
      const modifierUserId = 'Novus Modifier';
      jobRolesService.update(testJobRoleA._id,
        newName,
        newDescription,
        modifierUserId)
        .then(() => {
          const projectADocument = mockProjectsRepository.testProjectsDatabase[testProjectA._id];
          const projectATeam = projectADocument.team;
          assert(projectATeam[1].job_role !== newName,
           'The job_role for testProjectA\'s second team member should not have been updated.');

          const projectBDocument = mockProjectsRepository.testProjectsDatabase[testProjectB._id];
          const projectBTeam = projectBDocument.team;
          assert(projectBTeam[0].job_role !== newName,
           'The job_role for testProjectB\'s first team member should not have been updated.');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should update the JobRole name of the utilizations of projects in each user\'s utilization'
      + ' document, if that user had the JobRole that was updated.', (done) => {
      const newName = 'Novus Name';
      const newDescription = 'Novus Description';
      const modifierUserId = 'Novus Modifier';
      jobRolesService.update(testJobRoleA._id,
        newName,
        newDescription,
        modifierUserId)
        .then(() => {
          const utilADocument = mockUtilizationRepository
            .testUtilizationDatabase[testUtilizationA._id];
          const utilAProjects = utilADocument.projects;
          const secondUtilizationJobRole = utilAProjects[0].utilization[1].job_role;
          assert(secondUtilizationJobRole === newName,
           'The job_role for the project\'s utilization was not updated.');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should not update the JobRole name of the utilizations of projects in each'
      + ' user\'s utilization document, if that user did not had the JobRole that was updated.'
      , (done) => {
      const newName = 'Novus Name';
      const newDescription = 'Novus Description';
      const modifierUserId = 'Novus Modifier';
      jobRolesService.update(testJobRoleA._id,
        newName,
        newDescription,
        modifierUserId)
        .then(() => {
          const utilADocument = mockUtilizationRepository
            .testUtilizationDatabase[testUtilizationA._id];
          const utilAProjects = utilADocument.projects;
          assert(utilAProjects[0].utilization[0].job_role !== newName,
           'The job_role for the testUtilizationA\'s first project,'
           + ' first utilization was not supposed to be updated.');

          const utilBDocument = mockUtilizationRepository
            .testUtilizationDatabase[testUtilizationB._id];
          const utilBProjects = utilBDocument.projects;
          assert(utilBProjects[0].utilization[0].job_role !== newName,
           'The job_role for the testUtilizationB\'s first project,'
           + ' first utilization was not supposed to be updated.');
          assert(utilBProjects[0].utilization[0].job_role !== newName,
           'The job_role for the testUtilizationB\'s first project,'
           + ' second utilization was not supposed to be updated.');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });
  });
});
