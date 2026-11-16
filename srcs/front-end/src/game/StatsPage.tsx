import './StatsPage.css';

function StatsPage() {
  return (
    <div className="stats">
      <table className="stats-table">
        <thead>
          <tr>
            <th>Game</th>
            <th>Time</th>
            <th>Win</th>
            <th>Death</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Game 1</td>
            <td>42s</td>
            <td>Yes</td>
            <td>1</td>
          </tr>
          <tr>
            <td>Game 2</td>
            <td>-</td>
            <td>No</td>
            <td>12</td>
          </tr>
          <tr>
            <td>Game 3</td>
            <td>147s</td>
            <td>Yes</td>
            <td>6</td>
          </tr>
          <tr>
            <td>Game 4</td>
            <td>22s</td>
            <td>Yes</td>
            <td>0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StatsPage;