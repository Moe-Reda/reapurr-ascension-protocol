import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../lib/contracts';
import { parseEther } from 'viem';

export interface BatchOperation {
  id: string;
  type: 'stake' | 'unstake' | 'claim' | 'approve';
  poolAddress: string;
  pid: number;
  amount?: string;
  tokenAddress?: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  txHash?: string;
}

export interface BatchOperationResult {
  operations: BatchOperation[];
  isLoading: boolean;
  error?: string;
  executeBatch: (ops: Omit<BatchOperation, 'id' | 'status' | 'error' | 'txHash'>[]) => Promise<void>;
  resetBatch: () => void;
}

export const useBatchContractOperations = (): BatchOperationResult => {
  const [operations, setOperations] = useState<BatchOperation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const { writeContractAsync } = useWriteContract();
  const { data: receipt, isPending: isWaiting } = useWaitForTransactionReceipt();

  // Execute a batch of operations
  const executeBatch = useCallback(async (
    ops: Omit<BatchOperation, 'id' | 'status' | 'error' | 'txHash'>[]
  ) => {
    if (ops.length === 0) return;

    setIsLoading(true);
    setError(undefined);

    // Initialize operations with pending status
    const initializedOps: BatchOperation[] = ops.map((op, index) => ({
      ...op,
      id: `${op.type}-${op.pid}-${index}`,
      status: 'pending' as const,
    }));

    setOperations(initializedOps);

    try {
      // Execute operations sequentially to avoid nonce issues
      for (let i = 0; i < initializedOps.length; i++) {
        const op = initializedOps[i];
        
        try {
          let txHash: string;

          switch (op.type) {
            case 'stake':
              if (!op.amount) throw new Error('Amount required for stake operation');
              txHash = await writeContractAsync({
                address: op.poolAddress as `0x${string}`,
                abi: CONTRACT_ABIS.RewardPool,
                functionName: 'stake',
                args: [op.pid, parseEther(op.amount)],
              });
              break;

            case 'unstake':
              if (!op.amount) throw new Error('Amount required for unstake operation');
              txHash = await writeContractAsync({
                address: op.poolAddress as `0x${string}`,
                abi: CONTRACT_ABIS.RewardPool,
                functionName: 'withdraw',
                args: [op.pid, parseEther(op.amount)],
              });
              break;

            case 'claim':
              txHash = await writeContractAsync({
                address: op.poolAddress as `0x${string}`,
                abi: CONTRACT_ABIS.RewardPool,
                functionName: 'claim',
                args: [op.pid],
              });
              break;

            case 'approve':
              if (!op.tokenAddress || !op.amount) {
                throw new Error('Token address and amount required for approve operation');
              }
              txHash = await writeContractAsync({
                address: op.tokenAddress as `0x${string}`,
                abi: CONTRACT_ABIS.ERC20,
                functionName: 'approve',
                args: [op.poolAddress as `0x${string}`, parseEther(op.amount)],
              });
              break;

            default:
              throw new Error(`Unknown operation type: ${op.type}`);
          }

          // Update operation status to success
          setOperations(prev => prev.map(prevOp => 
            prevOp.id === op.id 
              ? { ...prevOp, status: 'success' as const, txHash }
              : prevOp
          ));

        } catch (opError) {
          const errorMessage = opError instanceof Error ? opError.message : 'Operation failed';
          
          // Update operation status to error
          setOperations(prev => prev.map(prevOp => 
            prevOp.id === op.id 
              ? { ...prevOp, status: 'error' as const, error: errorMessage }
              : prevOp
          ));

          // Continue with next operation instead of failing entire batch
          console.error(`Operation ${op.id} failed:`, opError);
        }

        // Small delay between operations to avoid overwhelming the network
        if (i < initializedOps.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

    } catch (batchError) {
      const errorMessage = batchError instanceof Error ? batchError.message : 'Batch execution failed';
      setError(errorMessage);
      console.error('Batch execution failed:', batchError);
    } finally {
      setIsLoading(false);
    }
  }, [writeContractAsync]);

  // Reset batch state
  const resetBatch = useCallback(() => {
    setOperations([]);
    setError(undefined);
    setIsLoading(false);
  }, []);

  return {
    operations,
    isLoading: isLoading || isWaiting,
    error,
    executeBatch,
    resetBatch,
  };
};



