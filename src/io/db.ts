import { TestCase } from '../model/models'

interface TestDatabase {
  saveTestCase(tc: TestCase): Promise<void>
}

class InMemoryDatabase implements TestDatabase {
  testCases: { [key: string]: TestCase } = {}

  saveTestCase(tc: TestCase): Promise<void> {
    this.testCases[tc.key] = tc
    return Promise.resolve()
  }
}
