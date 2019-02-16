import * as React from 'react'

interface TestOptions {
  url: string
}

interface TestLauncherProps {
  onOptions: (options: TestOptions) => void
}
class TestLauncher extends React.PureComponent<TestLauncherProps> {
  render() {
    return <div>launcher</div>
  }
}

interface TestRunnerProps {
  options: TestOptions
}
class TestRunner extends React.PureComponent<TestRunnerProps> {
  render() {
    return <div>runner</div>
  }
}

interface TestToolProps {}
interface TestToolState {
  options: TestOptions | null
}

class TestTool extends React.PureComponent<TestToolProps, TestToolState> {
  state: TestToolState = {
    options: null,
  }

  onOptions = (options: TestOptions) => {
    this.setState({ options })
  }

  render() {
    return this.state.options ? (
      <TestRunner options={this.state.options} />
    ) : (
      <TestLauncher onOptions={this.onOptions} />
    )
  }
}

export class Root extends React.PureComponent {
  render() {
    return <TestTool />
  }
}
