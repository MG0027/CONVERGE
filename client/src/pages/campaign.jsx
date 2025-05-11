import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCampaigns } from '@/store/campaignSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Campaign() {
  const dispatch = useDispatch();
  const { items: campaigns = [], status } = useSelector((state) => state.campaign);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCampaigns());
    }
  }, [status, dispatch]);

  return (
    <>
      <h1 className="text-3xl font-bold mb-12 text-center">Campaign History</h1>
      <div className="p-4 flex justify-center">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-lg font-semibold ">Title</TableHead>
              <TableHead className="text-lg font-semibold text-center">Audience</TableHead>
              <TableHead className="text-lg font-semibold text-center">Created At</TableHead>
              <TableHead className="text-lg font-semibold text-center">Success Rate</TableHead>
            </TableRow>
          </TableHeader>
         <TableBody>
  {campaigns.map(cam => {
    const isGood = cam.successRate > 50;
    return (
      <TableRow key={cam.id}>
        <TableCell className="">{cam.title}</TableCell>
        <TableCell className="text-center">{cam.audience}</TableCell>
        <TableCell className="text-center">
          {new Date(cam.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell className="text-center">
          <span
            className={`
              inline-block
              px-2 py-0.5
              ${isGood ? 'text-green-800' : 'text-red-600'}
              bg-gray-100
              rounded
              font-medium
            `}
          >
            {cam.successRate}%
          </span>
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>

        </Table>
      </div>
    </>
  );
}
